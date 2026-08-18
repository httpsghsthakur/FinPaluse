"""
FinPilot — Transaction Feature Engineering

Transforms raw transaction records into comprehensive numerical and text feature representations.
Features include:
- Normalized & cleaned merchant text
- Numerical log(amount), z-score, round-amount indicators
- Temporal features (day_of_week, day_of_month, is_weekend, month)
- Payment channel & account categorical encodings
- User-specific historical merchant frequency & average spend
"""
from __future__ import annotations

import re
from typing import Any
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer


def clean_merchant_text(text: str | None) -> str:
    """Normalize raw transaction description / merchant string."""
    if not text:
        return "unknown"
    t = str(text).lower()
    # Remove common banking noise: POS, UPI, ACH, REF, ID, trailing numbers
    t = re.sub(r"\b(upi|pos|ach|neft|rtgs|imps|ref|id|txn|dr|cr|pvt|ltd|inc|llc)\b", " ", t)
    t = re.sub(r"[\d\-_/\\*#:.]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t if t else "unknown"


class TransactionFeatureExtractor:
    """Extracts rich feature matrix from transaction data."""

    def __init__(self, max_tfidf_features: int = 500):
        self.tfidf = TfidfVectorizer(
            max_features=max_tfidf_features,
            ngram_range=(1, 2),
            stop_words="english",
        )
        self.is_fitted = False
        self.merchant_history: dict[str, dict[str, float]] = {}

    def fit(self, df: pd.DataFrame) -> "TransactionFeatureExtractor":
        """Fit TF-IDF vectorizer and compute merchant historical statistics."""
        cleaned_text = df["merchant"].apply(clean_merchant_text)
        self.tfidf.fit(cleaned_text)

        # Store merchant historical stats
        grouped = df.groupby("merchant")["amount"].agg(
            count="count",
            mean=lambda x: float(np.abs(x).mean()),
            std=lambda x: float(np.abs(x).std()) if len(x) > 1 else 0.0,
        )
        self.merchant_history = grouped.to_dict(orient="index")
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transform transactions DataFrame into feature matrix."""
        if not self.is_fitted:
            raise ValueError("Feature extractor must be fitted before transforming.")

        # Text features
        cleaned_text = df["merchant"].apply(clean_merchant_text)
        tfidf_features = self.tfidf.transform(cleaned_text).toarray()

        # Numerical & Temporal features
        num_features = []
        for _, row in df.iterrows():
            amt = float(row.get("amount", 0.0))
            abs_amt = abs(amt)
            log_amt = float(np.log1p(abs_amt))
            is_income = 1.0 if amt > 0 else 0.0
            is_round = 1.0 if abs_amt > 0 and abs_amt == round(abs_amt) else 0.0

            # Date parsing
            dt = pd.to_datetime(row.get("date", pd.Timestamp.now()))
            dow = dt.dayofweek / 6.0
            dom = (dt.day - 1) / 30.0
            month = (dt.month - 1) / 11.0
            is_weekend = 1.0 if dt.dayofweek >= 5 else 0.0

            # Historical merchant context
            merchant = row.get("merchant", "")
            m_stats = self.merchant_history.get(merchant, {"count": 1, "mean": abs_amt, "std": 0.0})
            m_count_log = float(np.log1p(m_stats.get("count", 1)))
            m_mean = m_stats.get("mean", abs_amt)
            m_std = m_stats.get("std", 0.0) or 1.0
            amount_zscore = float((abs_amt - m_mean) / m_std)

            num_features.append([
                amt,
                abs_amt,
                log_amt,
                is_income,
                is_round,
                dow,
                dom,
                month,
                is_weekend,
                m_count_log,
                amount_zscore,
            ])

        num_matrix = np.array(num_features, dtype=np.float32)
        return np.hstack([tfidf_features, num_matrix])
