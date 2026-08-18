"""Scenario and ScenarioResult models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), default="")
    income_change_pct: Mapped[float] = mapped_column(Float, default=0.0)
    one_time_expense: Mapped[float] = mapped_column(Float, default=0.0)
    monthly_savings_change: Mapped[float] = mapped_column(Float, default=0.0)
    expense_cut_category: Mapped[str | None] = mapped_column(String(50))
    expense_cut_pct: Mapped[float] = mapped_column(Float, default=0.0)
    months_without_income: Mapped[int] = mapped_column(Integer, default=0)
    monthly_income_delta: Mapped[float | None] = mapped_column(Float)
    monthly_expense_delta: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ScenarioResult(Base):
    __tablename__ = "scenario_results"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    scenario_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    baseline_runway_months: Mapped[float] = mapped_column(Float, default=0.0)
    scenario_runway_months: Mapped[float] = mapped_column(Float, default=0.0)
    baseline_net_worth_12m: Mapped[float] = mapped_column(Float, default=0.0)
    scenario_net_worth_12m: Mapped[float] = mapped_column(Float, default=0.0)
    monthly_points: Mapped[dict | None] = mapped_column(JSON)
    goal_impacts: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
