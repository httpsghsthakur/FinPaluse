"""Budget model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    monthly_limit: Mapped[float] = mapped_column(Float, nullable=False)
    month: Mapped[str] = mapped_column(String(7), nullable=False)  # YYYY-MM

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_budgets_user_month", "user_id", "month"),
        Index("ix_budgets_user_category_month", "user_id", "category_id", "month", unique=True),
    )
