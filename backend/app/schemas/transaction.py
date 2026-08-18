"""Transaction schemas — matches frontend Transaction, TransactionFilters, PaginatedTransactions."""
from __future__ import annotations

from typing import Optional, Literal

from pydantic import Field

from app.schemas.common import CamelModel


class TransactionResponse(CamelModel):
    """Matches frontend Transaction interface."""
    id: str
    date: str
    merchant: str
    category_id: str
    account_id: str
    amount: float
    status: Literal["settled", "pending"] = "settled"
    is_recurring: bool = False
    is_anomaly: Optional[bool] = None
    anomaly_reason: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class TransactionCreate(CamelModel):
    """Create transaction — Omit<Transaction, 'id'>."""
    date: str
    merchant: str
    category_id: str
    account_id: str
    amount: float
    status: Literal["settled", "pending"] = "settled"
    is_recurring: bool = False
    is_anomaly: Optional[bool] = None
    anomaly_reason: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class TransactionUpdate(CamelModel):
    """Partial update for a transaction."""
    date: Optional[str] = None
    merchant: Optional[str] = None
    category_id: Optional[str] = None
    account_id: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[Literal["settled", "pending"]] = None
    is_recurring: Optional[bool] = None
    is_anomaly: Optional[bool] = None
    anomaly_reason: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class TransactionFilters(CamelModel):
    """Query parameters for transaction listing."""
    search: Optional[str] = None
    category_ids: Optional[list[str]] = None
    account_ids: Optional[list[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    anomaly_only: Optional[bool] = None
    recurring_only: Optional[bool] = None
    sort_by: Optional[Literal["date", "amount", "merchant"]] = "date"
    sort_order: Optional[Literal["asc", "desc"]] = "desc"
    page: Optional[int] = 1
    limit: Optional[int] = 20


class PaginatedTransactions(CamelModel):
    """Paginated transaction response matching frontend PaginatedTransactions."""
    transactions: list[TransactionResponse]
    total: int
    page: int
    total_pages: int


class CSVImportResult(CamelModel):
    """Result of CSV import."""
    imported_count: int
