"""Insight model."""
from __future__ import annotations

import uuid
from datetime import datetime, date

from sqlalchemy import String, Boolean, Date, DateTime, Text, Float, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Insight(Base):
    __tablename__ = "insights"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="info")  # info, warning, alert, success
    type: Mapped[str] = mapped_column(String(20), default="tip")  # alert, trend, win, tip
    date: Mapped[date] = mapped_column(Date, nullable=False)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_liked: Mapped[bool | None] = mapped_column(Boolean)
    why_explanation: Mapped[str] = mapped_column(Text, default="")
    grounded_data: Mapped[dict | None] = mapped_column(JSON)  # [{label, value}]
    action_label: Mapped[str | None] = mapped_column(String(100))
    action_path: Mapped[str | None] = mapped_column(String(200))

    # Signal source for the insight engine
    signal_type: Mapped[str | None] = mapped_column(String(50))
    signal_category: Mapped[str | None] = mapped_column(String(50))
    signal_severity_score: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="insights")
