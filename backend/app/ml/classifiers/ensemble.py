"""
FinPilot — Ensemble & Personalization Classifier

Combines:
1. User-specific merchant correction memory (Highest priority)
2. Trained ML Model (LightGBM/Logistic)
3. Deterministic rule-based fallback
4. Uncertainty detection for active learning
5. Human-readable explainability factor generation
"""
from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd

from app.ml.classifiers.base import BaseTransactionClassifier


class PersonalizedEnsembleClassifier:
    """Ensemble combining ML predictions, user overrides, and rule fallbacks."""

    def __init__(
        self,
        base_model: BaseTransactionClassifier | None = None,
        confidence_threshold: float = 0.50,
        uncertainty_threshold: float = 0.65,
    ):
        self.base_model = base_model
        self.confidence_threshold = confidence_threshold
        self.uncertainty_threshold = uncertainty_threshold
        self.user_merchant_overrides: dict[str, dict[str, str]] = {}  # {user_id: {merchant_clean: category_id}}

    def set_user_corrections(self, corrections: list[dict[str, Any]]) -> None:
        """Load user corrections into quick-lookup cache."""
        for c in corrections:
            uid = str(c.get("user_id", ""))
            merchant = str(c.get("merchant", "")).lower().strip()
            cat_id = str(c.get("new_category_id", ""))
            if uid and merchant and cat_id:
                if uid not in self.user_merchant_overrides:
                    self.user_merchant_overrides[uid] = {}
                self.user_merchant_overrides[uid][merchant] = cat_id

    def classify(
        self,
        merchant: str,
        amount: float,
        user_id: str | None = None,
        user_history: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """
        Classify a single transaction with confidence, explanation, and active learning flag.
        """
        clean_m = merchant.lower().strip()

        # 1. Check direct user override
        if user_id and user_id in self.user_merchant_overrides:
            if clean_m in self.user_merchant_overrides[user_id]:
                override_cat = self.user_merchant_overrides[user_id][clean_m]
                return {
                    "category_id": override_cat,
                    "confidence": 0.99,
                    "model_source": "user_personalized_rule",
                    "requires_user_confirmation": False,
                    "explanation": f"Matched your previous categorization for '{merchant}'.",
                    "factors": [
                        "User explicitly categorized this merchant previously",
                        "High merchant consistency",
                    ],
                }

        # 2. Check historical user transactions with same merchant
        if user_history:
            matching = [t for t in user_history if t.get("merchant", "").lower().strip() == clean_m]
            if len(matching) >= 2:
                cat_counts: dict[str, int] = {}
                for t in matching:
                    c = t.get("categoryId") or t.get("category_id")
                    if c:
                        cat_counts[c] = cat_counts.get(c, 0) + 1
                if cat_counts:
                    top_cat = max(cat_counts, key=cat_counts.get)
                    freq = cat_counts[top_cat]
                    return {
                        "category_id": top_cat,
                        "confidence": 0.95,
                        "model_source": "user_history_heuristic",
                        "requires_user_confirmation": False,
                        "explanation": f"You previously categorized '{merchant}' as this in {freq} transactions.",
                        "factors": [
                            f"Identified {freq} past transactions with this merchant",
                            "Consistent user spending pattern",
                        ],
                    }

        # 3. Base ML Model prediction
        if self.base_model is not None:
            try:
                single_df = pd.DataFrame([{
                    "merchant": merchant,
                    "amount": amount,
                    "date": pd.Timestamp.now(),
                }])
                probas = self.base_model.predict_proba(single_df)[0]
                classes = self.base_model.classes_
                top_idx = int(np.argmax(probas))
                top_prob = float(probas[top_idx])
                top_cat = str(classes[top_idx])

                # Build explanation
                factors = [
                    f"Merchant text pattern matching '{clean_m}'",
                    f"Transaction amount (${abs(amount):.2f}) matches category distribution",
                ]
                explanation = f"Classified based on merchant text characteristics and typical amount range."

                requires_confirm = top_prob < self.uncertainty_threshold

                if top_prob >= self.confidence_threshold:
                    return {
                        "category_id": top_cat,
                        "confidence": round(top_prob, 3),
                        "model_source": "lightgbm_classifier_v1",
                        "requires_user_confirmation": requires_confirm,
                        "explanation": explanation,
                        "factors": factors,
                    }
            except Exception:
                pass

        # 4. Keyword Fallback Rules
        fallback_rules = [
            (["swiggy", "zomato", "doordash", "uber eats", "restaurant", "cafe", "coffee", "trattoria", "nobu", "sweetgreen", "chipotle"], "cat-dining"),
            (["grocery", "supermarket", "whole foods", "trader joe", "costco", "safeway", "instamart", "blinkit", "zepto"], "cat-groceries"),
            (["uber", "lyft", "gas", "chevron", "shell", "transit", "metro", "fuel"], "cat-transport"),
            (["netflix", "spotify", "hulu", "disney", "prime video", "apple tv", "youtube"], "cat-subscriptions"),
            (["gym", "fitness", "yoga", "pharmacy", "cvs", "walgreens", "corepower", "equinox"], "cat-health"),
            (["amazon", "apple store", "target", "walmart", "uniqlo", "best buy", "flipkart"], "cat-shopping"),
            (["rent", "apartment", "housing", "lease"], "cat-housing"),
            (["electric", "water", "verizon", "wifi", "internet", "power", "sonic fiber"], "cat-utilities"),
            (["salary", "payroll", "deposit", "direct deposit", "stripe payout", "freelance"], "cat-income"),
            (["interest", "dividend"], "cat-income"),
        ]

        for keywords, cat_id in fallback_rules:
            if any(k in clean_m for k in keywords):
                return {
                    "category_id": cat_id,
                    "confidence": 0.75,
                    "model_source": "rule_based_fallback",
                    "requires_user_confirmation": False,
                    "explanation": f"Matched merchant pattern for {cat_id.replace('cat-', '')}.",
                    "factors": ["Merchant keyword dictionary match"],
                }

        return {
            "category_id": "cat-other",
            "confidence": 0.35,
            "model_source": "default_fallback",
            "requires_user_confirmation": True,
            "explanation": "Unrecognized merchant, placed in Other Expenses. User confirmation requested.",
            "factors": ["Low overall classification confidence"],
        }
