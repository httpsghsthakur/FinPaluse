"""
FinPilot — Transaction Classifier Abstract Base Class
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any
import numpy as np
import pandas as pd


class BaseTransactionClassifier(ABC):
    """Abstract interface for all transaction category classifiers."""

    @abstractmethod
    def fit(self, X: pd.DataFrame | np.ndarray, y: pd.Series | np.ndarray) -> "BaseTransactionClassifier":
        """Train the classifier."""
        pass

    @abstractmethod
    def predict(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        """Predict category IDs."""
        pass

    @abstractmethod
    def predict_proba(self, X: pd.DataFrame | np.ndarray) -> np.ndarray:
        """Predict calibrated category class probabilities."""
        pass

    @abstractmethod
    def save(self, filepath: str) -> None:
        """Serialize model artifact to disk."""
        pass

    @abstractmethod
    def load(self, filepath: str) -> "BaseTransactionClassifier":
        """Load model artifact from disk."""
        pass
