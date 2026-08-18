"""Transaction model."""
from __future__ import annotations

import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Float, Boolean, Date, DateTime, Text,
    ForeignKey, func, Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    account_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    merchant: Mapped[str] = mapped_column(String(500), nullable=False)
    original_description: Mapped[str | None] = mapped_column(Text)
    amount: Mapped[float] = mapped_column(Float, nullable=False)  # negative=expense, positive=income
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    status: Mapped[str] = mapped_column(String(20), default="settled")  # settled, pending
    payment_channel: Mapped[str | None] = mapped_column(String(50))  # card, bank_transfer, upi, etc.

    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_reason: Mapped[str | None] = mapped_column(Text)
    anomaly_score: Mapped[float | None] = mapped_column(Float)

    notes: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text)  # Stored as comma-separated, returned as array

    # ML metadata
    ml_category_id: Mapped[str | None] = mapped_column(String(50))
    ml_category_confidence: Mapped[float | None] = mapped_column(Float)
    ml_model_version: Mapped[str | None] = mapped_column(String(100))

    location: Mapped[str | None] = mapped_column(String(255))
    country: Mapped[str | None] = mapped_column(String(3))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

    __table_args__ = (
        Index("ix_transactions_user_date", "user_id", "date"),
        Index("ix_transactions_user_category", "user_id", "category_id"),
        Index("ix_transactions_merchant", "merchant"),
    )
