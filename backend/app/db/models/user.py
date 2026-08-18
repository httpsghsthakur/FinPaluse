"""User model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    theme: Mapped[str] = mapped_column(String(10), default="dark")
    first_day_of_month: Mapped[int] = mapped_column(default=1)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    chat_personality: Mapped[str] = mapped_column(String(20), default="balanced")
    share_data_for_analytics: Mapped[bool] = mapped_column(Boolean, default=True)
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    pin_code: Mapped[str | None] = mapped_column(String(10))

    # Privacy consents
    consent_personalization: Mapped[bool] = mapped_column(Boolean, default=True)
    consent_global_training: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="user", cascade="all, delete-orphan")
