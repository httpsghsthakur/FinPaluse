"""User correction model for personalized learning."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserCorrection(Base):
    __tablename__ = "user_corrections"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    transaction_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False
    )
    old_category_id: Mapped[str] = mapped_column(String(50), nullable=False)
    new_category_id: Mapped[str] = mapped_column(String(50), nullable=False)
    model_confidence: Mapped[float | None] = mapped_column(Float)
    model_version: Mapped[str | None] = mapped_column(String(100))
    merchant: Mapped[str | None] = mapped_column(String(500))

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
