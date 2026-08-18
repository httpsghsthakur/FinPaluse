"""Dashboard schemas — matches frontend DashboardSummary type."""
from __future__ import annotations

from typing import Optional

from app.schemas.common import CamelModel
from app.schemas.transaction import TransactionResponse


class CashFlowMonth(CamelModel):
    month: str
    income: float
    expenses: float
    savings: float


class CategorySpend(CamelModel):
    category_id: str
    category_name: str
    color: str
    amount: float
    percentage: float
    budget: float


class UpcomingBill(CamelModel):
    id: str
    merchant: str
    amount: float
    due_date: str
    category_id: str
    account_name: str
    days_away: int


class LowBalanceAlert(CamelModel):
    has_low_balance: bool
    date: Optional[str] = None
    predicted_balance: Optional[float] = None
    threshold: Optional[float] = None
    suggested_action: Optional[str] = None


class DashboardSummaryResponse(CamelModel):
    """Matches frontend DashboardSummary interface exactly."""
    net_worth: float
    net_worth_mom_pct: float
    monthly_spending: float
    monthly_budget_total: float
    cash_runway_months: float
    savings_rate_pct: float
    total_liquid_cash: float
    total_debt: float
    cash_flow_history: list[CashFlowMonth]
    category_spend: list[CategorySpend]
    recent_transactions: list[TransactionResponse]
    upcoming_bills: list[UpcomingBill]
    low_balance_alert: LowBalanceAlert
