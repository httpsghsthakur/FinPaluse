"""Category model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="MoreHorizontal")
    color: Mapped[str] = mapped_column(String(10), default="#94A3B8")
    type: Mapped[str | None] = mapped_column(String(20))  # expense, income, transfer
    monthly_budget: Mapped[float | None] = mapped_column(Float, default=0.0)
    default_monthly_budget: Mapped[float | None] = mapped_column(Float)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)

    # Hierarchical classification support
    parent_category_id: Mapped[str | None] = mapped_column(
        String(50), ForeignKey("categories.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    subcategories = relationship("Category", backref="parent_category", remote_side="Category.id")
