"""Account schemas — matches frontend Account type exactly."""
from __future__ import annotations

from typing import Literal, Optional

from app.schemas.common import CamelModel


class AccountResponse(CamelModel):
    """Matches frontend Account interface."""
    id: str
    name: str
    type: Literal["checking", "savings", "credit", "investment"]
    balance: float
    currency: str
    institution: str
    mask: str
    color: str
    last_synced: str
    is_active: bool


class AccountCreate(CamelModel):
    """Create account — frontend sends Omit<Account, 'id' | 'lastSynced' | 'isActive'>."""
    name: str
    type: Literal["checking", "savings", "credit", "investment"]
    balance: float = 0.0
    currency: str = "USD"
    institution: str = ""
    mask: str = ""
    color: str = "#3B82F6"
