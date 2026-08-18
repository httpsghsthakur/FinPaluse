"""Forecast model."""
from __future__ import annotations

import uuid
from datetime import datetime, date

from sqlalchemy import String, Float, Boolean, Date, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False)
    predicted_balance: Mapped[float] = mapped_column(Float, nullable=False)
    lower_bound: Mapped[float] = mapped_column(Float, nullable=False)
    upper_bound: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.85)
    model_version: Mapped[str | None] = mapped_column(String(100))
    horizon_days: Mapped[int] = mapped_column(default=30)
    is_actual: Mapped[bool] = mapped_column(Boolean, default=False)
    actual_balance: Mapped[float | None] = mapped_column(Float)
    events: Mapped[dict | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
