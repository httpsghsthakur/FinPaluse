"""
FinPilot — Database Session Management

Async SQLAlchemy engine + session factory.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()

engine_kwargs: dict = {
    "echo": getattr(settings, "DEBUG", getattr(settings, "app_debug", False)),
}

if "sqlite" not in settings.database_url:
    connect_args: dict = {}
    
    # If connecting to Supabase or cloud PostgreSQL
    if "supabase.co" in settings.database_url or "supabase.com" in settings.database_url or "pooler.supabase.com" in settings.database_url:
        connect_args["statement_cache_size"] = 0
        connect_args["ssl"] = "require"

    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
    })
    if connect_args:
        engine_kwargs["connect_args"] = connect_args

engine = create_async_engine(
    settings.database_url,
    **engine_kwargs
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async DB session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
