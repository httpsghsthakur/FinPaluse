"""
FinPilot Backend — Main Application Entry Point

FastAPI application with lifespan management for database initialization.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.db.base import Base
from app.db.session import engine, async_session_factory
from app.api.v1.router import api_router

# Import all models so they are registered with the Base metadata
import app.db.models  # noqa: F401

settings = get_settings()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    setup_logging()
    logger.info("FinPilot backend starting up...")

    # Create tables (dev mode) — production uses Alembic migrations
    if settings.app_env == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created/verified")

        # Seed demo data if configured
        if settings.seed_demo_data:
            from app.api.v1.admin import seed_database
            async with async_session_factory() as session:
                try:
                    await seed_database(session)
                    await session.commit()
                    logger.info("Demo data seeded successfully")
                except Exception as e:
                    await session.rollback()
                    logger.error(f"Failed to seed demo data: {e}")

    logger.info(f"FinPilot backend ready — env={settings.app_env}")
    yield

    # Shutdown
    await engine.dispose()
    logger.info("FinPilot backend shut down.")


app = FastAPI(
    title="FinPilot — AI Financial Copilot API",
    description=(
        "Complete financial intelligence backend for FinPilot.\n\n"
        "Provides transaction management, ML-powered categorization, "
        "cash-flow forecasting, anomaly detection, what-if simulation, "
        "goal tracking, and an AI copilot with grounded financial reasoning."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "FinPilot AI Financial Copilot",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
