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

import ssl

engine_kwargs: dict = {
    "echo": getattr(settings, "DEBUG", getattr(settings, "app_debug", False)),
}

db_url = settings.database_url

if "sqlite" not in db_url:
    connect_args: dict = {}
    
    # If connecting to Supabase or cloud PostgreSQL
    if "supabase" in db_url or "pooler" in db_url:
        connect_args["statement_cache_size"] = 0
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_ctx
        
        # Clean query parameters for asyncpg
        if "asyncpg" in db_url and "?" in db_url:
            db_url = db_url.split("?")[0]

    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
    })
    if connect_args:
        engine_kwargs["connect_args"] = connect_args

engine = create_async_engine(
    db_url,
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
