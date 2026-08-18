"""
FinPilot — LightGBM / XGBoost Gradient Boosted Classifier

Production-grade supervised classifier combining text TF-IDF features with engineered
numerical, temporal, and user behavioral features.
"""
from __future__ import annotations

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder

from app.ml.classifiers.base import BaseTransactionClassifier
from app.ml.features.transaction_features import TransactionFeatureExtractor


class LightGBMTransactionClassifier(BaseTransactionClassifier):
    """Production LightGBM transaction classifier."""

    def __init__(
        self,
        n_estimators: int = 150,
        learning_rate: float = 0.05,
        max_depth: int = 6,
        num_leaves: int = 31,
    ):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.num_leaves = num_leaves

        self.feature_extractor = TransactionFeatureExtractor(max_tfidf_features=400)
        self.label_encoder = LabelEncoder()
        self.model: LGBMClassifier | None = None
        self.calibrated_model: CalibratedClassifierCV | None = None
        self.classes_: np.ndarray | None = None

    def fit(self, df: pd.DataFrame, y: pd.Series | np.ndarray) -> "LightGBMTransactionClassifier":
        """Fit feature extractor, label encoder, and calibrated LightGBM."""
        self.feature_extractor.fit(df)
        X_mat = self.feature_extractor.transform(df)

        y_encoded = self.label_encoder.fit_transform(y)
        self.classes_ = self.label_encoder.classes_

        base_lgbm = LGBMClassifier(
            n_estimators=self.n_estimators,
            learning_rate=self.learning_rate,
            max_depth=self.max_depth,
            num_leaves=self.num_leaves,
            class_weight="balanced",
            random_state=42,
            verbosity=-1,
            n_jobs=-1,
        )

        base_lgbm.fit(X_mat, y_encoded)
        self.model = base_lgbm

        # Confidence calibration using sigmoid (Platt scaling)
        try:
            self.calibrated_model = CalibratedClassifierCV(estimator=base_lgbm, method="sigmoid", cv="prefit")
            self.calibrated_model.fit(X_mat, y_encoded)
        except Exception:
            self.calibrated_model = None

        return self

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            raise ValueError("Model not fitted.")
        X_mat = self.feature_extractor.transform(df)
        if self.calibrated_model:
            y_pred_idx = np.argmax(self.calibrated_model.predict_proba(X_mat), axis=1)
        else:
            y_pred_idx = self.model.predict(X_mat)
        return self.label_encoder.inverse_transform(y_pred_idx)

    def predict_proba(self, df: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            raise ValueError("Model not fitted.")
        X_mat = self.feature_extractor.transform(df)
        if self.calibrated_model:
            return self.calibrated_model.predict_proba(X_mat)
        return self.model.predict_proba(X_mat)

    def save(self, filepath: str) -> None:
        payload = {
            "feature_extractor": self.feature_extractor,
            "label_encoder": self.label_encoder,
            "model": self.model,
            "calibrated_model": self.calibrated_model,
            "classes": self.classes_,
        }
        joblib.dump(payload, filepath)

    def load(self, filepath: str) -> "LightGBMTransactionClassifier":
        payload = joblib.load(filepath)
        self.feature_extractor = payload["feature_extractor"]
        self.label_encoder = payload["label_encoder"]
        self.model = payload["model"]
        self.calibrated_model = payload["calibrated_model"]
        self.classes_ = payload["classes"]
        return self
