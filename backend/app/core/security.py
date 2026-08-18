"""
FinPilot Backend — Security Utilities

PII masking, password hashing, JWT helpers.
"""
from __future__ import annotations

import re
from typing import Optional


def mask_card_number(card: str) -> str:
    """Mask credit/debit card numbers: **** **** **** 1234"""
    digits = re.sub(r"\D", "", card)
    if len(digits) < 4:
        return "****"
    return f"**** **** **** {digits[-4:]}"


def mask_account_number(account: str) -> str:
    """Mask bank account numbers: ****1234"""
    digits = re.sub(r"\D", "", account)
    if len(digits) < 4:
        return "****"
    return f"****{digits[-4:]}"


def mask_email(email: str) -> str:
    """Mask email: a***z@domain.com"""
    parts = email.split("@")
    if len(parts) != 2:
        return "****"
    name = parts[0]
    if len(name) <= 2:
        return f"{'*' * len(name)}@{parts[1]}"
    return f"{name[0]}{'*' * (len(name) - 2)}{name[-1]}@{parts[1]}"


def mask_phone(phone: str) -> str:
    """Mask phone: ****1234"""
    digits = re.sub(r"\D", "", phone)
    if len(digits) < 4:
        return "****"
    return f"****{digits[-4:]}"


# PII detection patterns
_PII_PATTERNS = {
    "card_number": re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b"),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "phone": re.compile(r"\b(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b"),
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "aadhaar": re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"),
}


def detect_pii(text: str) -> dict[str, list[str]]:
    """Detect PII in text. Returns dict of {pii_type: [matches]}."""
    results: dict[str, list[str]] = {}
    for pii_type, pattern in _PII_PATTERNS.items():
        matches = pattern.findall(text)
        if matches:
            results[pii_type] = matches
    return results


def sanitize_for_llm(text: str) -> str:
    """Remove PII from text before sending to external LLM."""
    result = text
    for pii_type, pattern in _PII_PATTERNS.items():
        if pii_type == "card_number":
            result = pattern.sub("[CARD ****]", result)
        elif pii_type == "email":
            result = pattern.sub("[EMAIL REDACTED]", result)
        elif pii_type == "phone":
            result = pattern.sub("[PHONE REDACTED]", result)
        elif pii_type == "ssn":
            result = pattern.sub("[SSN REDACTED]", result)
        elif pii_type == "aadhaar":
            result = pattern.sub("[AADHAAR REDACTED]", result)
    return result


# ── Supabase & JWT Authentication ─────────────────────────────────────────────
from fastapi import Header, HTTPException, status
from app.core.config import get_settings

DEMO_USER_ID = "00000000-0000-4000-a000-000000000001"


def decode_supabase_jwt(token: str) -> dict | None:
    """Decode and validate a Supabase Auth JWT token."""
    settings = get_settings()
    try:
        from jose import jwt
        # If secret is provided, verify signature
        if settings.supabase_jwt_secret:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        else:
            # Fallback to unverified claims inspection for local testing
            payload = jwt.get_unverified_claims(token)
            return payload
    except Exception:
        return None


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency to extract the current user ID from Supabase Auth.
    Falls back gracefully to DEMO_USER_ID if no token is passed or in demo mode.
    """
    if not authorization:
        return DEMO_USER_ID

    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return DEMO_USER_ID

    payload = decode_supabase_jwt(token)
    if payload and "sub" in payload:
        return str(payload["sub"])

    return DEMO_USER_ID
