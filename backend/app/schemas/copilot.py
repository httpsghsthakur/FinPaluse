"""Copilot schemas — matches frontend ChatMessage type."""
from __future__ import annotations

from typing import Optional, Literal

from app.schemas.common import CamelModel
from app.schemas.insight import GroundedMetricResponse


class QuickAction(CamelModel):
    label: str
    action: Optional[str] = None
    path: Optional[str] = None


class ChatMessageResponse(CamelModel):
    """Matches frontend ChatMessage interface."""
    id: str
    role: Optional[Literal["user", "assistant"]] = None
    sender: Optional[Literal["user", "ai"]] = None
    content: Optional[str] = None
    text: Optional[str] = None
    timestamp: str
    grounded_data: Optional[list[GroundedMetricResponse]] = None
    confidence: Optional[Literal["High", "Medium", "Low"]] = None
    confidence_band: Optional[str] = None
    confidence_score: Optional[float] = None
    is_streaming: Optional[bool] = None
    quick_actions: Optional[list[QuickAction]] = None


class CopilotRequest(CamelModel):
    """Request to the copilot."""
    message: str
    personality: Optional[Literal["concise", "balanced", "detailed"]] = "balanced"
    session_id: Optional[str] = None
