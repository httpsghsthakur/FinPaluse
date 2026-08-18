"""ML Model registry models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import String, Float, Integer, DateTime, Text, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    dataset_version: Mapped[str | None] = mapped_column(String(100))
    features_version: Mapped[str | None] = mapped_column(String(100))
    algorithm: Mapped[str] = mapped_column(String(100), default="")
    hyperparameters: Mapped[dict | None] = mapped_column(JSON)
    metrics: Mapped[dict | None] = mapped_column(JSON)
    artifact_path: Mapped[str | None] = mapped_column(String(500))
    code_commit: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="staging")  # staging, production, archived
    training_duration_sec: Mapped[float | None] = mapped_column(Float)
    model_size_bytes: Mapped[int | None] = mapped_column(Integer)
    inference_latency_ms: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class TrainingDataset(Base):
    __tablename__ = "training_datasets"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    dataset_name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="synthetic")
    license: Mapped[str | None] = mapped_column(String(100))
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    feature_schema: Mapped[dict | None] = mapped_column(JSON)
    label_schema: Mapped[dict | None] = mapped_column(JSON)
    data_hash: Mapped[str | None] = mapped_column(String(64))
    file_path: Mapped[str | None] = mapped_column(String(500))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
