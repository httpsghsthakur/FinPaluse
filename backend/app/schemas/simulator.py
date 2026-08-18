"""Simulator schemas — matches frontend Scenario, ScenarioResult types."""
from __future__ import annotations

from typing import Optional

from app.schemas.common import CamelModel


class ScenarioRequest(CamelModel):
    """Matches frontend Scenario interface (input)."""
    id: Optional[str] = None
    name: str = ""
    monthly_income_delta: Optional[float] = None
    monthly_expense_delta: Optional[float] = None
    income_change_pct: Optional[float] = 0.0
    one_time_expense: float = 0.0
    monthly_savings_change: Optional[float] = 0.0
    expense_cut_category: Optional[str] = None
    expense_cut_pct: Optional[float] = 0.0
    months_without_income: int = 0
    created_at: Optional[str] = None


class ScenarioResultPoint(CamelModel):
    """Matches frontend ScenarioResultPoint interface."""
    month: str
    baseline: float
    scenario: float


class GoalImpact(CamelModel):
    """Matches frontend GoalImpact interface."""
    goal_id: str
    goal_name: str
    original_months: int
    new_months: int
    delayed_months: int


class ScenarioResultResponse(CamelModel):
    """Matches frontend ScenarioResult interface."""
    scenario_id: Optional[str] = None
    baseline_runway_months: float
    scenario_runway_months: float
    baseline_net_worth_12m: float
    scenario_net_worth_12m: float
    monthly_points: list[ScenarioResultPoint]
    goal_impacts: list[GoalImpact]
