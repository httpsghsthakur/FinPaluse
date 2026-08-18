"""Category schemas — matches frontend Category type."""
from __future__ import annotations

from typing import Optional, Literal

from app.schemas.common import CamelModel


class CategoryResponse(CamelModel):
    """Matches frontend Category interface."""
    id: str
    name: str
    icon: str
    color: str
    type: Optional[Literal["expense", "income", "transfer"]] = None
    monthly_budget: Optional[float] = None
    default_monthly_budget: Optional[float] = None
    is_system: Optional[bool] = None
    is_custom: Optional[bool] = None


class CategoryCreate(CamelModel):
    """Create category — Omit<Category, 'id'>."""
    name: str
    icon: str = "MoreHorizontal"
    color: str = "#94A3B8"
    type: Optional[Literal["expense", "income", "transfer"]] = "expense"
    monthly_budget: Optional[float] = 0.0
    default_monthly_budget: Optional[float] = None
    is_system: Optional[bool] = False
    is_custom: Optional[bool] = True


class CategoryUpdate(CamelModel):
    """Partial update for a category."""
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    type: Optional[Literal["expense", "income", "transfer"]] = None
    monthly_budget: Optional[float] = None
    default_monthly_budget: Optional[float] = None
    is_system: Optional[bool] = None
    is_custom: Optional[bool] = None
