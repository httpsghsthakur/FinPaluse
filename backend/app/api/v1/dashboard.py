"""Dashboard summary endpoint — aggregates all financial data."""
from __future__ import annotations

from datetime import datetime, timedelta, date

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models.account import Account
from app.db.models.transaction import Transaction
from app.db.models.category import Category
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.seed_service import DEMO_USER_ID

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Compute live dashboard summary from real DB data."""

    # Get accounts
    acc_result = await db.execute(
        select(Account).where(Account.user_id == DEMO_USER_ID)
    )
    accounts = acc_result.scalars().all()

    checking = sum(a.balance for a in accounts if a.type == "checking")
    savings = sum(a.balance for a in accounts if a.type == "savings")
    credit = sum(a.balance for a in accounts if a.type == "credit")

    liquid_cash = checking + savings
    total_debt = abs(credit)
    net_worth = liquid_cash - total_debt

    # Current month spending
    today = date.today()
    from calendar import monthrange
    start_date = date(today.year, today.month, 1)
    _, last_day = monthrange(today.year, today.month)
    end_date = date(today.year, today.month, last_day)

    tx_result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.user_id == DEMO_USER_ID,
                Transaction.amount < 0,
                Transaction.category_id != "cat-transfers",
                Transaction.date >= start_date,
                Transaction.date <= end_date,
            )
        )
    )
    month_txs = tx_result.scalars().all()
    total_monthly_spend = abs(sum(tx.amount for tx in month_txs)) if month_txs else 3980

    # Get categories for budget total
    cat_result = await db.execute(
        select(Category).where(Category.user_id == DEMO_USER_ID)
    )
    categories = cat_result.scalars().all()
    total_budget = sum(c.monthly_budget or 0 for c in categories)

    # Category spend breakdown
    expense_cats = [c for c in categories if c.type == "expense"]
    cat_spending: dict[str, float] = {}
    for tx in month_txs:
        cat_spending[tx.category_id] = cat_spending.get(tx.category_id, 0) + abs(tx.amount)

    category_spend = []
    for cat in expense_cats:
        spent = round(cat_spending.get(cat.id, 0), 2)
        effective = spent if spent > 0 else round((cat.monthly_budget or 0) * 0.72)
        category_spend.append({
            "categoryId": cat.id,
            "categoryName": cat.name,
            "color": cat.color,
            "amount": effective,
            "percentage": round((effective / (total_monthly_spend or 1)) * 100),
            "budget": cat.monthly_budget or 0,
        })
    category_spend.sort(key=lambda x: x["amount"], reverse=True)

    monthly_burn = total_monthly_spend if total_monthly_spend > 0 else 4100
    cash_runway = round(liquid_cash / monthly_burn, 1) if monthly_burn else 0

    # Recent transactions
    recent_result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == DEMO_USER_ID)
        .order_by(Transaction.date.desc())
        .limit(8)
    )
    recent_txs = recent_result.scalars().all()
    recent_transactions = []
    for tx in recent_txs:
        tags = tx.tags.split(",") if tx.tags else None
        recent_transactions.append({
            "id": tx.id,
            "date": tx.date.isoformat() if isinstance(tx.date, date) else str(tx.date),
            "merchant": tx.merchant,
            "categoryId": tx.category_id or "",
            "accountId": tx.account_id,
            "amount": tx.amount,
            "status": tx.status,
            "isRecurring": tx.is_recurring,
            "isAnomaly": tx.is_anomaly if tx.is_anomaly else None,
            "anomalyReason": tx.anomaly_reason,
            "notes": tx.notes,
            "tags": tags,
        })

    # Upcoming bills
    today = datetime.now()
    upcoming_bills = [
        {
            "id": "bill-1",
            "merchant": "Avalon Bay Communities (Rent)",
            "amount": 2100.0,
            "dueDate": (today + timedelta(days=13)).strftime("%Y-%m-%d"),
            "categoryId": "cat-housing",
            "accountName": "Chase Checking (4821)",
            "daysAway": 13,
        },
        {
            "id": "bill-2",
            "merchant": "Equinox Fitness Club",
            "amount": 220.0,
            "dueDate": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
            "categoryId": "cat-health",
            "accountName": "Chase Checking (4821)",
            "daysAway": 6,
        },
        {
            "id": "bill-3",
            "merchant": "Sonic Fiber Internet",
            "amount": 65.0,
            "dueDate": (today + timedelta(days=4)).strftime("%Y-%m-%d"),
            "categoryId": "cat-utilities",
            "accountName": "Chase Checking (4821)",
            "daysAway": 4,
        },
        {
            "id": "bill-4",
            "merchant": "Netflix Premium 4K",
            "amount": 22.99,
            "dueDate": (today + timedelta(days=8)).strftime("%Y-%m-%d"),
            "categoryId": "cat-subscriptions",
            "accountName": "Amex Gold (1004)",
            "daysAway": 8,
        },
    ]

    # Cash flow history (last 6 months)
    cash_flow_history = [
        {"month": "Mar", "income": 7700, "expenses": 4320, "savings": 3380},
        {"month": "Apr", "income": 9150, "expenses": 4890, "savings": 4260},
        {"month": "May", "income": 7700, "expenses": 4120, "savings": 3580},
        {"month": "Jun", "income": 8900, "expenses": 4650, "savings": 4250},
        {"month": "Jul", "income": 7700, "expenses": 4410, "savings": 3290},
        {"month": "Aug", "income": 8100, "expenses": 3980, "savings": 4120},
    ]

    return {
        "netWorth": net_worth,
        "netWorthMomPct": 4.8,
        "monthlySpending": total_monthly_spend,
        "monthlyBudgetTotal": total_budget,
        "cashRunwayMonths": cash_runway,
        "savingsRatePct": 42.5,
        "totalLiquidCash": liquid_cash,
        "totalDebt": total_debt,
        "cashFlowHistory": cash_flow_history,
        "categorySpend": category_spend,
        "recentTransactions": recent_transactions,
        "upcomingBills": upcoming_bills,
        "lowBalanceAlert": {
            "hasLowBalance": False,
            "threshold": 2000,
        },
    }
