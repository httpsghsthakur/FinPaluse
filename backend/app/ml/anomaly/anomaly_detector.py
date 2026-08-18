"""
FinPilot — Anomaly Detection Model (Model 3)

Identifies unusual spending, amount spikes, and unexpected merchant transactions
using Isolation Forest trained per user category / spending distribution.
"""
from __future__ import annotations

from typing import Any
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


class AnomalyDetector:
    """Isolation Forest based anomaly detector for unusual personal transactions."""

    def __init__(self, contamination: float = 0.03):
        self.contamination = contamination
        self.model: IsolationForest | None = None
        self.category_baselines: dict[str, dict[str, float]] = {}

    def fit(self, transactions_df: pd.DataFrame) -> "AnomalyDetector":
        """Compute category spending baselines and fit Isolation Forest."""
        if transactions_df.empty:
            return self

        df = transactions_df.copy()
        df["abs_amount"] = df["amount"].abs()

        # Compute per-category stats (mean, std, 95th percentile)
        cat_stats = df.groupby("category_id")["abs_amount"].agg(
            mean="mean",
            std=lambda x: float(x.std()) if len(x) > 1 else 0.0,
            p95=lambda x: float(np.percentile(x, 95)) if len(x) > 0 else 0.0,
            p99=lambda x: float(np.percentile(x, 99)) if len(x) > 0 else 0.0,
        )
        self.category_baselines = cat_stats.to_dict(orient="index")

        # Extract numerical features for Isolation Forest
        X = self._extract_features(df)
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100,
        )
        self.model.fit(X)
        return self

    def score_transaction(
        self,
        amount: float,
        category_id: str,
        merchant: str = "",
        user_history_df: pd.DataFrame | None = None,
    ) -> dict[str, Any]:
        """
        Evaluate if a transaction is anomalous. Returns score, anomaly flag, and explanation.
        """
        abs_amt = abs(amount)
        base = self.category_baselines.get(category_id, {"mean": 80.0, "std": 30.0, "p95": 180.0, "p99": 350.0})
        cat_mean = base.get("mean", 80.0) or 80.0
        cat_p95 = base.get("p95", 180.0) or 180.0
        cat_std = base.get("std", 30.0) or 30.0

        multiplier = abs_amt / cat_mean if cat_mean > 0 else 1.0
        is_spike = abs_amt > cat_p95 and multiplier >= 2.5

        # Isolation forest anomaly score if fitted
        if_score = 0.0
        if self.model is not None:
            features = np.array([[abs_amt, np.log1p(abs_amt), multiplier, cat_mean]])
            raw_score = -self.model.score_samples(features)[0]  # Higher = more anomalous
            if_score = float(np.clip(raw_score, 0.0, 1.0))

        anomaly_score = max(if_score, 0.85 if is_spike else 0.15)
        is_anomaly = bool(is_spike or anomaly_score >= 0.70)

        # Generate human-readable explanation
        clean_cat = category_id.replace("cat-", "").capitalize() if category_id else "General"
        if is_anomaly:
            explanation = (
                f"${abs_amt:,.2f} is {multiplier:.1f}x higher than your typical {clean_cat} "
                f"transaction (avg ${cat_mean:,.2f})."
            )
        else:
            explanation = f"Within normal range for {clean_cat} (typical avg ${cat_mean:,.2f})."

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_score, 3),
            "anomaly_type": "unusual_amount_spike" if is_spike else "standard",
            "explanation": explanation,
            "typical_range_min": round(max(0, cat_mean - cat_std), 2),
            "typical_range_max": round(cat_p95, 2),
            "deviation_factor": round(multiplier, 2),
        }

    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        features = []
        for _, row in df.iterrows():
            amt = float(row.get("abs_amount", abs(row.get("amount", 0.0))))
            cat = row.get("category_id", "")
            base = self.category_baselines.get(cat, {"mean": amt})
            mean = base.get("mean", amt) or amt
            multiplier = amt / mean if mean > 0 else 1.0
            features.append([amt, np.log1p(amt), multiplier, mean])
        return np.array(features, dtype=np.float32)


anomaly_detector = AnomalyDetector()
