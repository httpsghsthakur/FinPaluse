"""Anomaly model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, Text, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    anomaly_score: Mapped[float] = mapped_column(Float, nullable=False)
    anomaly_type: Mapped[str] = mapped_column(String(50), default="unusual_transaction")
    explanation: Mapped[str] = mapped_column(Text, default="")
    typical_range_min: Mapped[float | None] = mapped_column(Float)
    typical_range_max: Mapped[float | None] = mapped_column(Float)
    deviation_factor: Mapped[float | None] = mapped_column(Float)
    model_version: Mapped[str | None] = mapped_column(String(100))
    features_used: Mapped[dict | None] = mapped_column(JSON)
    user_feedback: Mapped[str | None] = mapped_column(String(20))  # confirmed, dismissed

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
