"""
FinPilot — Baseline Logistic Regression + TF-IDF Classifier

Serves as the baseline model against which more advanced models are benchmarked.
"""
from __future__ import annotations

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer

from app.ml.classifiers.base import BaseTransactionClassifier
from app.ml.features.transaction_features import clean_merchant_text


class LogisticBaselineClassifier(BaseTransactionClassifier):
    """TF-IDF + Logistic Regression baseline."""

    def __init__(self, c_param: float = 1.0, max_iter: int = 1000):
        self.c_param = c_param
        self.max_iter = max_iter
        self.pipeline: Pipeline | None = None
        self.classes_: np.ndarray | None = None

    def fit(self, X: pd.DataFrame | np.ndarray, y: pd.Series | np.ndarray) -> "LogisticBaselineClassifier":
        if isinstance(X, pd.DataFrame):
            texts = X["merchant"].apply(clean_merchant_text)
        else:
            texts = [clean_merchant_text(str(x)) for x in X]

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
            ("clf", LogisticRegression(C=self.c_param, max_iter=self.max_iter, class_weight="balanced", random_state=42)),
        ])

        self.pipeline.fit(texts, y)
        self.classes_ = self.pipeline.classes_
        return self

    def predict(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        if not self.pipeline:
            raise ValueError("Model not fitted.")
        if isinstance(X, pd.DataFrame):
            texts = X["merchant"].apply(clean_merchant_text)
        else:
            texts = [clean_merchant_text(str(x)) for x in X]
        return self.pipeline.predict(texts)

    def predict_proba(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        if not self.pipeline:
            raise ValueError("Model not fitted.")
        if isinstance(X, pd.DataFrame):
            texts = X["merchant"].apply(clean_merchant_text)
        else:
            texts = [clean_merchant_text(str(x)) for x in X]
        return self.pipeline.predict_proba(texts)

    def save(self, filepath: str) -> None:
        joblib.dump({"pipeline": self.pipeline, "classes": self.classes_}, filepath)

    def load(self, filepath: str) -> "LogisticBaselineClassifier":
        data = joblib.load(filepath)
        self.pipeline = data["pipeline"]
        self.classes_ = data["classes"]
        return self
