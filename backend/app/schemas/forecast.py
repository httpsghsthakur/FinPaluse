"""Forecast schemas — matches frontend ForecastPoint, ForecastEvent types."""
from __future__ import annotations

from typing import Optional

from app.schemas.common import CamelModel


class ForecastEventResponse(CamelModel):
    """Matches frontend ForecastEvent interface."""
    id: str
    date: str
    type: str  # 'payday' | 'recurring_bill' | 'goal_contrib' | 'custom'
    title: str
    amount: float
    account_id: str


class ForecastPointResponse(CamelModel):
    """Matches frontend ForecastPoint interface."""
    date: str
    actual_balance: Optional[float] = None
    forecasted_balance: float
    lower_bound: float
    upper_bound: float
    is_actual: bool
    events: list[ForecastEventResponse] = []


class ForecastResponse(CamelModel):
    """Response from GET /forecast."""
    points: list[ForecastPointResponse]
    events: list[ForecastEventResponse]
