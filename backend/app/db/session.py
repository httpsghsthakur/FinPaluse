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
import socket

# Force IPv4 resolution to prevent 'Network is unreachable' on Render
# when uvloop/asyncpg attempts to use IPv6 addresses.
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(*args, **kwargs):
    if "family" not in kwargs or kwargs["family"] == 0:
        kwargs["family"] = socket.AF_INET
    return orig_getaddrinfo(*args, **kwargs)
socket.getaddrinfo = getaddrinfo_ipv4

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
            
        # Render + uvloop IPv6 resolution bug workaround
        # Manually resolve the pooler host to an IPv4 address and replace it in the URL
        import urllib.parse
        parsed = urllib.parse.urlparse(db_url)
        if parsed.hostname and not parsed.hostname.replace('.', '').isnumeric():
            try:
                # getaddrinfo with AF_INET forces IPv4 resolution
                ipv4_host = socket.getaddrinfo(parsed.hostname, parsed.port, socket.AF_INET)[0][4][0]
                # Reconstruct the URL with the IPv4 address
                netloc = parsed.netloc.replace(parsed.hostname, ipv4_host)
                db_url = parsed._replace(netloc=netloc).geturl()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Failed to resolve IPv4 for {parsed.hostname}: {e}")

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
