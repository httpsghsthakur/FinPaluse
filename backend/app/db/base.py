"""
FinPilot — SQLAlchemy Declarative Base
"""
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass
