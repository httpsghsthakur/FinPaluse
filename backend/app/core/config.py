"""
FinPilot Backend — Core Configuration

All settings loaded from environment variables via Pydantic Settings.
Never hardcode secrets.
"""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env / environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    PROJECT_NAME: str = "Finpluse — AI Financial Copilot"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "finpluse-dev-secret-key-change-in-production-min-32-chars-long"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    seed_demo_data: bool = True

    @property
    def app_env(self) -> str:
        return self.ENVIRONMENT

    @property
    def app_debug(self) -> bool:
        return self.DEBUG

    # ── Database ─────────────────────────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./finpilot.db"
    database_url_sync: str = "sqlite:///./finpilot.db"

    # ── Redis ────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── CORS ─────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── Custom In-House AI Engine ────────────────────────────────
    ai_engine: Literal["custom_engine", "self_hosted"] = "custom_engine"
    llm_provider: str = "custom_engine"

    # ── Embeddings ───────────────────────────────────────────────
    embedding_model: str = "all-MiniLM-L6-v2"

    # ── MLflow ───────────────────────────────────────────────────
    mlflow_tracking_uri: str = "http://localhost:5000"

    # ── Supabase & Auth ──────────────────────────────────────────
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    auth_mode: Literal["none", "api_key", "jwt", "supabase"] = "none"
    api_key: str = "dev-api-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # ── Data ─────────────────────────────────────────────────────
    seed_demo_data: bool = True
    demo_user_count: int = 20
    demo_transaction_count: int = 100_000

    # ── Privacy ──────────────────────────────────────────────────
    default_data_consent_personalization: bool = True
    default_data_consent_global_training: bool = False


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
