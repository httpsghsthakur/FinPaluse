"""
Common Pydantic utilities for camelCase JSON serialization.

The frontend expects camelCase keys. We use snake_case in Python
and convert automatically via alias_generator.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


class CamelModel(BaseModel):
    """Base model that serializes to camelCase for the frontend."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
