"""
FinPilot — AI Intent Classifier & Query Router

Classifies user query into distinct financial intents and selects the exact deterministic tools to invoke.
"""
from __future__ import annotations

from typing import Literal

FinancialIntent = Literal[
    "affordability_check",
    "spending_analysis",
    "budget_query",
    "goal_query",
    "cashflow_forecast",
    "runway_net_worth",
    "scenario_simulation",
    "recurring_subscriptions",
    "anomaly_investigation",
    "document_qa",
    "general_guidance",
]


class IntentRouter:
    """Classifies user natural language query into intent and required tools."""

    def route(self, query: str) -> tuple[FinancialIntent, list[str]]:
        q = query.lower()

        if any(w in q for w in ("afford", "can i buy", "can i purchase", "should i buy", "cost")):
            return "affordability_check", ["get_cashflow", "get_runway", "get_budget_status", "get_goals"]

        if any(w in q for w in ("spend", "spent", "dining", "groceries", "category", "breakdown", "outflow")):
            return "spending_analysis", ["get_spending_by_category", "get_budget_status", "get_transactions"]

        if any(w in q for w in ("budget", "over budget", "limit", "pacing")):
            return "budget_query", ["get_budget_status", "get_spending_by_category"]

        if any(w in q for w in ("goal", "emergency fund", "trip", "house", "save for", "deadline")):
            return "goal_query", ["get_goals", "get_spending_by_category"]

        if any(w in q for w in ("forecast", "run out of money", "balance next month", "project", "next 30 days")):
            return "cashflow_forecast", ["get_cashflow_forecast", "get_recurring_payments"]

        if any(w in q for w in ("runway", "net worth", "total balance", "assets", "debt", "liquid")):
            return "runway_net_worth", ["get_net_worth", "get_runway"]

        if any(w in q for w in ("what if", "simulate", "lose my job", "cut expenses", "salary raise")):
            return "scenario_simulation", ["simulate_scenario", "get_runway"]

        if any(w in q for w in ("recurring", "subscription", "bills", "netflix", "gym", "due")):
            return "recurring_subscriptions", ["get_recurring_payments"]

        if any(w in q for w in ("anomaly", "fraud", "unusual", "suspicious", "flagged")):
            return "anomaly_investigation", ["get_anomalies", "get_transactions"]

        if any(w in q for w in ("10-k", "10-q", "sec", "annual report", "apple revenue", "filing", "document")):
            return "document_qa", ["search_financial_documents"]

        return "general_guidance", ["get_net_worth", "get_runway", "get_spending_by_category", "get_goals"]


intent_router = IntentRouter()
