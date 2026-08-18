"""
FinPilot — Anomaly Detection Training & Evaluation

Fits Isolation Forest on historical transactions and computes precision/recall on anomaly flags.
"""
from __future__ import annotations

import time
from typing import Any
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score

from app.ml.anomaly.anomaly_detector import AnomalyDetector
from app.ml.registry.model_registry import model_registry


def train_and_evaluate_anomaly_detector(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
) -> dict[str, Any]:
    """Train Isolation Forest anomaly detector."""
    print("  [Anomaly Detector] Training Isolation Forest on spending distributions...")
    t0 = time.time()

    detector = AnomalyDetector(contamination=0.03)
    train_mapped = train_df.rename(columns={"category_primary": "category_id"})
    detector.fit(train_mapped)

    # Vectorized fast evaluation on test set
    test_mapped = test_df.rename(columns={"category_primary": "category_id"}).head(2000)
    predictions = []
    for _, row in test_mapped.iterrows():
        res = detector.score_transaction(
            amount=row["amount"],
            category_id=row["category_id"],
            merchant=row.get("merchant", ""),
        )
        predictions.append(res["is_anomaly"])

    y_true = test_mapped["is_anomaly"].fillna(False).astype(bool)
    y_pred = pd.Series(predictions)

    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print(f"    [OK] Anomaly Detector -> Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f} ({time.time() - t0:.2f}s)")

    model_path = model_registry.get_model_path("anomaly_detector", version=1)
    joblib.dump(detector, str(model_path))
    print(f"    [OK] Model registered to: {model_path.name}")

    return {
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "model_artifact": str(model_path),
    }
