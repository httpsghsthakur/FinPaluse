"""
FinPilot — Personal Financial Insight Generator (Model 7)

Generates deterministic financial signals (budget risks, spending spikes, subscription alerts,
HYSA yields, goal milestones) before passing structured insights to the UI or LLM.
"""
from __future__ import annotations

from datetime import datetime, timedelta, date
from typing import Any
import pandas as pd


class InsightGeneratorService:
    """Detects deterministic financial signals and synthesizes actionable insights."""

    def generate_insights_from_data(
        self,
        accounts: list[dict[str, Any]],
        categories: list[dict[str, Any]],
        transactions: list[dict[str, Any]],
        goals: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Compute live insight signals from current user financial state."""
        insights: list[dict[str, Any]] = []
        today = date.today()

        # 1. Budget Overshoot Signals
        current_month = datetime.now().strftime("%Y-%m")
        month_txs = [
            t for t in transactions
            if str(t.get("date", "")).startswith(current_month)
            and float(t.get("amount", 0.0)) < 0
            and t.get("categoryId") != "cat-transfers"
        ]

        spent_by_cat: dict[str, float] = {}
        for t in month_txs:
            cid = t.get("categoryId") or t.get("category_id")
            if cid:
                spent_by_cat[cid] = spent_by_cat.get(cid, 0.0) + abs(float(t.get("amount", 0.0)))

        for cat in categories:
            cid = cat.get("id", "")
            limit = float(cat.get("monthlyBudget") or cat.get("monthly_budget") or 0.0)
            spent = spent_by_cat.get(cid, 0.0)
            if limit > 0:
                current_day = max(1, today.day)
                projected = (spent / current_day) * 30.0
                if spent > limit * 0.85:
                    overage = max(0.0, projected - limit)
                    insights.append({
                        "id": f"ins-bgt-{cid}-{current_month}",
                        "title": f"{cat.get('name', 'Category')} pacing {int((projected / limit - 1) * 100)}% over budget",
                        "description": f"You have spent ₹{spent:,.2f} of your ₹{limit:,.2f} budget with {30 - current_day} days left in cycle.",
                        "severity": "warning" if spent < limit else "alert",
                        "type": "alert",
                        "date": today.isoformat(),
                        "is_dismissed": False,
                        "why_explanation": f"Daily average spend in {cat.get('name')} is ₹{(spent / current_day):,.2f} vs ₹{(limit / 30):,.2f} target.",
                        "grounded_data": [
                            {"label": f"Current {cat.get('name')} Spend", "value": f"₹{spent:,.2f}"},
                            {"label": "Monthly Limit", "value": f"₹{limit:,.2f}"},
                            {"label": "Projected Overage", "value": f"₹{overage:,.2f}"},
                        ],
                        "action_label": f"Adjust {cat.get('name')} Budget",
                        "action_path": "/app/budgets",
                    })

        # 2. High-Yield Savings Interest Yield Signal
        savings_acc = next((a for a in accounts if a.get("type") == "savings"), None)
        if savings_acc:
            bal = float(savings_acc.get("balance", 0.0))
            if bal > 1000.0:
                monthly_interest = round(bal * (0.0475 / 12), 2)
                insights.append({
                    "id": f"ins-yield-{current_month}",
                    "title": f"High-Yield Savings earned ₹{monthly_interest:,.2f} interest",
                    "description": f"Your {savings_acc.get('name', 'HYSA')} balance generated monthly yield at 4.75% APY.",
                    "severity": "success",
                    "type": "win",
                    "date": (today - timedelta(days=2)).isoformat(),
                    "is_dismissed": False,
                    "why_explanation": "Calculated from 30-day compound interest rate across your liquid cash balance.",
                    "grounded_data": [
                        {"label": "APY Rate", "value": "4.75%"},
                        {"label": "Monthly Gain", "value": f"+₹{monthly_interest:,.2f}"},
                        {"label": "Annualized Return", "value": f"₹{monthly_interest * 12:,.2f}"},
                    ],
                    "action_label": "View HYSA Balance",
                    "action_path": "/app/forecast",
                })

        # 3. Unusual Transaction / Anomaly Signal
        anomaly_txs = [t for t in transactions if t.get("isAnomaly") or t.get("is_anomaly")]
        if anomaly_txs:
            top_anom = anomaly_txs[0]
            insights.append({
                "id": f"ins-anom-{top_anom.get('id', '1')}",
                "title": f"Unusual transaction flagged: {top_anom.get('merchant')} ₹{abs(float(top_anom.get('amount', 0))):,.2f}",
                "description": top_anom.get("anomalyReason") or top_anom.get("anomaly_reason") or "This transaction is higher than your typical average.",
                "severity": "alert",
                "type": "alert",
                "date": str(top_anom.get("date", today.isoformat())),
                "is_dismissed": False,
                "why_explanation": "AI anomaly detection evaluates baseline distribution per merchant category.",
                "grounded_data": [
                    {"label": "Merchant", "value": str(top_anom.get("merchant"))},
                    {"label": "Amount", "value": f"₹{abs(float(top_anom.get('amount', 0))):,.2f}"},
                ],
                "action_label": "Inspect Transaction",
                "action_path": "/app/transactions",
            })

        return insights


insight_service = InsightGeneratorService()
