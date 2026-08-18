"""Recurring transaction model."""
from __future__ import annotations

import uuid
from datetime import datetime, date

from sqlalchemy import String, Float, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RecurringTransaction(Base):
    __tablename__ = "recurring_transactions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    merchant: Mapped[str] = mapped_column(String(500), nullable=False)
    category_id: Mapped[str | None] = mapped_column(String(50))
    account_id: Mapped[str | None] = mapped_column(String(50))
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=True)
    frequency: Mapped[str] = mapped_column(String(20), default="monthly")  # weekly, biweekly, monthly, quarterly, yearly
    expected_amount: Mapped[float] = mapped_column(Float, default=0.0)
    amount_variance: Mapped[float] = mapped_column(Float, default=0.0)
    expected_next_date: Mapped[date | None] = mapped_column(Date)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    last_seen_date: Mapped[date | None] = mapped_column(Date)
    occurrence_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
