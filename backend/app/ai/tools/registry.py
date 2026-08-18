"""
FinPilot — Deterministic Tool Execution Registry

Provides real calculated metrics to the AI Copilot:
- Transactions, Category spending, Budget status, Cash-flow forecast, Runway, Goals, Simulator, Anomalies, Recurring payments, Documents.
"""
from __future__ import annotations

from typing import Any
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.account import Account
from app.db.models.transaction import Transaction
from app.db.models.category import Category
from app.db.models.goal import Goal
from app.db.models.insight import Insight
from app.services.seed_service import DEMO_USER_ID
from app.ml.forecasting.forecast_model import cash_flow_forecaster
from app.ml.recurring.recurring_detector import recurring_detector
from app.ml.goals.goal_engine import goal_engine
from app.services.simulator_service import simulator_service
from app.schemas.simulator import ScenarioRequest
from app.ai.rag.retriever import retriever


class ToolRegistry:
    """Executes backend deterministic queries for the LLM."""

    @staticmethod
    async def get_net_worth(db: AsyncSession) -> dict[str, Any]:
        accs = (await db.execute(select(Account).where(Account.user_id == DEMO_USER_ID))).scalars().all()
        checking = sum(a.balance for a in accs if a.type == "checking")
        savings = sum(a.balance for a in accs if a.type == "savings")
        credit = sum(a.balance for a in accs if a.type == "credit")
        liquid = checking + savings
        net_worth = liquid + credit
        return {
            "net_worth": round(net_worth, 2),
            "liquid_cash": round(liquid, 2),
            "checking_balance": round(checking, 2),
            "savings_balance": round(savings, 2),
            "total_debt": round(abs(credit), 2),
        }

    @staticmethod
    async def get_runway(db: AsyncSession) -> dict[str, Any]:
        nw = await ToolRegistry.get_net_worth(db)
        tx_res = await db.execute(
            select(func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == DEMO_USER_ID,
                    Transaction.amount < 0,
                    Transaction.category_id != "cat-transfers",
                )
            )
        )
        total_expense = abs(tx_res.scalar() or 4200.0)
        monthly_burn = max(1000.0, total_expense / 6.0)
        runway_months = round(nw["liquid_cash"] / monthly_burn, 1)
        return {
            "cash_available": nw["liquid_cash"],
            "monthly_burn": round(monthly_burn, 2),
            "runway_months": runway_months,
            "status": "Healthy (6+ Months)" if runway_months >= 6.0 else "Moderate" if runway_months >= 3.0 else "Critical",
        }

    @staticmethod
    async def get_spending_by_category(db: AsyncSession) -> dict[str, Any]:
        cats = (await db.execute(select(Category).where(Category.user_id == DEMO_USER_ID))).scalars().all()
        cat_map = {c.id: {"name": c.name, "budget": c.monthly_budget or 0.0} for c in cats}

        tx_res = await db.execute(
            select(Transaction.category_id, func.sum(Transaction.amount)).where(
                and_(
                    Transaction.user_id == DEMO_USER_ID,
                    Transaction.amount < 0,
                    Transaction.category_id != "cat-transfers",
                )
            ).group_by(Transaction.category_id)
        )

        breakdown = []
        total = 0.0
        for cid, amt in tx_res.all():
            spent = abs(amt)
            total += spent
            info = cat_map.get(cid, {"name": cid, "budget": 0.0})
            breakdown.append({
                "category_id": cid,
                "name": info["name"],
                "spent": round(spent, 2),
                "budget": round(info["budget"], 2),
            })

        breakdown.sort(key=lambda x: x["spent"], reverse=True)
        return {"total_spending": round(total, 2), "categories": breakdown}

    @staticmethod
    async def get_budget_status(db: AsyncSession) -> dict[str, Any]:
        spending = await ToolRegistry.get_spending_by_category(db)
        over_budget = [c for c in spending["categories"] if c["budget"] > 0 and c["spent"] > c["budget"]]
        return {
            "total_budget": sum(c["budget"] for c in spending["categories"]),
            "total_spent": spending["total_spending"],
            "categories_over_budget": over_budget,
            "has_overages": len(over_budget) > 0,
        }

    @staticmethod
    async def get_goals(db: AsyncSession) -> list[dict[str, Any]]:
        goals = (await db.execute(select(Goal).where(Goal.user_id == DEMO_USER_ID))).scalars().all()
        results = []
        for g in goals:
            eval_res = goal_engine.evaluate_goal(
                target_amount=g.target_amount,
                current_amount=g.current_amount,
                monthly_contribution=g.monthly_contribution,
                deadline_date_str=g.deadline.isoformat(),
            )
            results.append({
                "id": g.id,
                "name": g.name,
                "target_amount": g.target_amount,
                "current_amount": g.current_amount,
                "progress_pct": round((g.current_amount / g.target_amount) * 100, 1),
                "monthly_contribution": g.monthly_contribution,
                "projected_completion": eval_res["projected_completion_date"],
                "boost_suggestion": eval_res["boost_suggestion"],
            })
        return results

    @staticmethod
    async def get_recurring_payments(db: AsyncSession) -> list[dict[str, Any]]:
        txs = (await db.execute(select(Transaction).where(Transaction.user_id == DEMO_USER_ID))).scalars().all()
        df = pd.DataFrame([{
            "merchant": t.merchant,
            "amount": t.amount,
            "date": t.date.isoformat(),
            "category_id": t.category_id,
            "account_id": t.account_id,
        } for t in txs])
        return recurring_detector.detect_recurring(df)

    @staticmethod
    async def get_anomalies(db: AsyncSession) -> list[dict[str, Any]]:
        txs = (await db.execute(select(Transaction).where(Transaction.user_id == DEMO_USER_ID, Transaction.is_anomaly == True))).scalars().all()
        return [{
            "id": t.id,
            "merchant": t.merchant,
            "amount": t.amount,
            "date": t.date.isoformat(),
            "anomaly_reason": t.anomaly_reason,
        } for t in txs]

    @staticmethod
    def search_documents(query: str) -> list[dict[str, Any]]:
        return retriever.search(query, top_k=3)


import pandas as pd
tool_registry = ToolRegistry()
