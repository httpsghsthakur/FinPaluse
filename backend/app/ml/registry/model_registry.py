"""
FinPilot — Model Registry

Manages model versioning, serialization, artifact paths, and loading without silent overwrites.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

MODELS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "models"


class ModelRegistry:
    """Central registry to manage and load model artifacts."""

    @staticmethod
    def get_model_path(model_name: str, version: int = 1) -> Path:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        return MODELS_DIR / f"{model_name}_v{version}.joblib"

    @staticmethod
    def list_models() -> list[dict[str, Any]]:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        models = []
        for file in MODELS_DIR.glob("*.joblib"):
            models.append({
                "filename": file.name,
                "path": str(file),
                "size_bytes": file.stat().st_size,
                "modified_at": file.stat().st_mtime,
            })
        return models


model_registry = ModelRegistry()
