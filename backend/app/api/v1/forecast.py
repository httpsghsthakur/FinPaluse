"""Forecast endpoints — cash-flow projection matching frontend ForecastPoint contract."""
from __future__ import annotations

from datetime import datetime, timedelta, date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.account import Account
from app.schemas.forecast import ForecastResponse, ForecastPointResponse, ForecastEventResponse
from app.services.seed_service import DEMO_USER_ID

router = APIRouter()


@router.get("", response_model=ForecastResponse)
async def get_forecast(
    days: int = Query(default=90, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate cash-flow forecast matching frontend's getForecast().
    
    Phase 1: Deterministic forecast (mirrors frontend mock logic).
    Phase 4: Replaced by ML forecasting models (Prophet, XGBoost).
    """
    # Get account balances
    result = await db.execute(
        select(Account).where(Account.user_id == DEMO_USER_ID)
    )
    accounts = result.scalars().all()

    total_checking = sum(a.balance for a in accounts if a.type == "checking")
    total_savings = sum(a.balance for a in accounts if a.type == "savings")
    current_liquid = total_checking + total_savings

    points: list[dict] = []
    events: list[dict] = []
    today = datetime.now().date()

    # Past 30 days — historical actual balance points
    past_running = current_liquid - 3400
    for d in range(30, 0, -1):
        past_date = today - timedelta(days=d)
        past_running += (3850 if d % 15 == 0 else 0) - (2100 if d % 30 == 0 else 85)

        points.append({
            "date": past_date.isoformat(),
            "actualBalance": round(past_running),
            "forecastedBalance": round(past_running),
            "lowerBound": round(past_running * 0.98),
            "upperBound": round(past_running * 1.02),
            "isActual": True,
            "events": [],
        })

    # Future projected days
    running_balance = current_liquid
    daily_burn = 115  # ~$3,450 / 30

    for day in range(days + 1):
        future_date = today + timedelta(days=day)
        date_str = future_date.isoformat()
        day_events: list[dict] = []
        dom = future_date.day

        # Payday on 1st and 15th
        if dom in (1, 15):
            ev = {
                "id": f"ev-pay-{day}",
                "date": date_str,
                "type": "payday",
                "title": "Direct Deposit Payroll",
                "amount": 3850.0,
                "accountId": "acc-checking",
            }
            day_events.append(ev)
            events.append(ev)
            running_balance += 3850

        # Rent on 1st
        if dom == 1:
            ev = {
                "id": f"ev-rent-{day}",
                "date": date_str,
                "type": "recurring_bill",
                "title": "Apartment Rent Lease",
                "amount": -2100.0,
                "accountId": "acc-checking",
            }
            day_events.append(ev)
            events.append(ev)
            running_balance -= 2100

        # Goal auto-contribution on 5th
        if dom == 5:
            ev = {
                "id": f"ev-goal-{day}",
                "date": date_str,
                "type": "goal_contrib",
                "title": "Auto Goal Savings (Emergency Fund)",
                "amount": -800.0,
                "accountId": "acc-savings",
            }
            day_events.append(ev)
            events.append(ev)

        running_balance -= daily_burn
        uncertainty = day * 35

        points.append({
            "date": date_str,
            "actualBalance": round(current_liquid) if day == 0 else None,
            "forecastedBalance": round(running_balance),
            "lowerBound": round(running_balance - uncertainty),
            "upperBound": round(running_balance + uncertainty),
            "isActual": day == 0,
            "events": day_events,
        })

    return {"points": points, "events": events}
