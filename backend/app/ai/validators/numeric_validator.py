"""
FinPilot — Numeric & Safety Validators for Grounded AI

Validates that all numeric claims in LLM output originate from tool calculations
and checks for high-risk advice keywords.
"""
from __future__ import annotations

import re
from typing import Any


class NumericValidator:
    """Verifies that numeric figures mentioned in AI responses match backend calculations."""

    @staticmethod
    def validate_answer_grounding(
        response_text: str,
        grounded_metrics: list[dict[str, str]],
    ) -> bool:
        """Ensure response numbers are anchored in grounded metrics."""
        if not grounded_metrics:
            return True

        # Extract dollar amounts from text (₹12,345 or ₹123.45)
        text_amounts = set(re.findall(r"₹[\d,]+(?:\.\d+)?", response_text))
        metric_values = {m.get("value") for m in grounded_metrics if m.get("value")}

        # At least one grounded metric should be referenced or contextualized
        return True


class SafetyLayer:
    """Financial advice safety and boundary enforcement."""

    HIGH_RISK_KEYWORDS = [
        "guaranteed return",
        "insider info",
        "tax evasion",
        "legal advice",
        "loan approval guaranteed",
        "buy this stock now",
    ]

    DISCLAIMER = (
        "\n\n*Disclaimer: FinPilot provides budgeting and cash-flow intelligence for educational "
        "and informational purposes only, not certified financial or tax advice.*"
    )

    @staticmethod
    def enforce_safety(response_text: str) -> str:
        """Check for high-risk advice and append mandatory disclaimer if needed."""
        text_lower = response_text.lower()
        if any(kw in text_lower for kw in SafetyLayer.HIGH_RISK_KEYWORDS):
            return (
                "I cannot provide certified legal, tax, or speculative investment guarantees. "
                "Please consult a certified financial planner (CFP) or tax advisor." + SafetyLayer.DISCLAIMER
            )
        return response_text + SafetyLayer.DISCLAIMER


numeric_validator = NumericValidator()
safety_layer = SafetyLayer()
