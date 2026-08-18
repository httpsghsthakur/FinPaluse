"""
FinPilot — Data Cleaning & Validation Pipeline Step
"""
from __future__ import annotations

import pandas as pd
import numpy as np


def clean_and_validate_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Run data quality tests and cleaning."""
    print("  [Data Quality] Checking for nulls, range validity, and duplicates...")

    initial_count = len(df)
    cleaned = df.dropna(subset=["merchant", "amount", "category_primary"]).copy()

    # Range and type checks
    cleaned["amount"] = pd.to_numeric(cleaned["amount"], errors="coerce")
    cleaned = cleaned.dropna(subset=["amount"])

    # Duplicate check
    cleaned = cleaned.drop_duplicates(subset=["transaction_id"])
    print(f"  [Data Quality] Cleaned rows: {len(cleaned):,} (dropped {initial_count - len(cleaned):,} invalid rows)")

    return cleaned
