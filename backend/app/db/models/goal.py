"""Goal model."""
from __future__ import annotations

import uuid
from datetime import datetime, date

from sqlalchemy import String, Float, Boolean, Date, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False)
    current_amount: Mapped[float] = mapped_column(Float, default=0.0)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="")  # Goal category (Safety, Travel, etc.)
    linked_account_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True
    )
    monthly_contribution: Mapped[float] = mapped_column(Float, default=0.0)
    color: Mapped[str] = mapped_column(String(10), default="#10B981")
    icon: Mapped[str] = mapped_column(String(50), default="Target")
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    boost_suggestion: Mapped[str | None] = mapped_column(Text)

    # Projection fields (computed)
    projected_completion_date: Mapped[date | None] = mapped_column(Date)
    completion_probability: Mapped[float | None] = mapped_column(Float)
    required_monthly_contribution: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="goals")
