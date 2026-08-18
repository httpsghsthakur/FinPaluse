"""Prediction audit model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, Text, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PredictionAudit(Base):
    __tablename__ = "prediction_audit"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    input_reference: Mapped[str] = mapped_column(String(200), nullable=False)  # e.g., transaction_id
    prediction: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    features_version: Mapped[str | None] = mapped_column(String(100))
    user_feedback: Mapped[str | None] = mapped_column(String(50))
    corrected_prediction: Mapped[str | None] = mapped_column(Text)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
