"""Budget schemas — matches frontend Budget type."""
from __future__ import annotations

from app.schemas.common import CamelModel


class BudgetResponse(CamelModel):
    """Matches frontend Budget interface."""
    id: str
    category_id: str
    monthly_limit: float
    spent: float
    month: str  # YYYY-MM
    predicted_spend: float


class BudgetUpdate(CamelModel):
    """Update budget limit for a category."""
    monthly_limit: float
