"""Insight schemas — matches frontend Insight, GroundedMetric, WeeklyDigest types."""
from __future__ import annotations

from typing import Optional

from app.schemas.common import CamelModel


class GroundedMetricResponse(CamelModel):
    """Matches frontend GroundedMetric interface."""
    label: str
    value: str


class InsightResponse(CamelModel):
    """Matches frontend Insight interface."""
    id: str
    title: str
    description: str
    severity: str  # info, warning, alert, success
    type: str  # alert, trend, win, tip
    date: str
    is_dismissed: bool
    is_liked: Optional[bool] = None
    why_explanation: str
    grounded_data: list[GroundedMetricResponse] = []
    action_label: Optional[str] = None
    action_path: Optional[str] = None


class WeeklyDigestResponse(CamelModel):
    """Matches frontend WeeklyDigest interface."""
    week_range: str
    summary_title: str
    total_income: float
    total_expenses: float
    net_savings: float
    top_category_name: str
    top_category_spend: float
    vs_last_week_pct: float
    bullets: list[str]
    actionable_tip: str
    anomalies_detected_count: int
