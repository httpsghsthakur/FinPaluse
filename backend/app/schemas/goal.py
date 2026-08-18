"""Goal schemas — matches frontend Goal type."""
from __future__ import annotations

from typing import Optional

from app.schemas.common import CamelModel


class GoalResponse(CamelModel):
    """Matches frontend Goal interface."""
    id: str
    name: str
    target_amount: float
    current_amount: float
    deadline: str  # YYYY-MM-DD
    category: str
    linked_account_id: str
    monthly_contribution: float
    color: str
    icon: str
    is_completed: bool
    boost_suggestion: Optional[str] = None


class GoalCreate(CamelModel):
    """Create goal — Omit<Goal, 'id' | 'isCompleted'>."""
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: str
    category: str = ""
    linked_account_id: str = ""
    monthly_contribution: float = 0.0
    color: str = "#10B981"
    icon: str = "Target"
    boost_suggestion: Optional[str] = None


class GoalUpdate(CamelModel):
    """Partial update for a goal."""
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[str] = None
    category: Optional[str] = None
    linked_account_id: Optional[str] = None
    monthly_contribution: Optional[float] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_completed: Optional[bool] = None
    boost_suggestion: Optional[str] = None


class GoalContribute(CamelModel):
    """Contribute to a goal."""
    amount: float
