"""
FinPilot — Time Series Feature Engineering

Generates lag features, rolling window metrics, and seasonal encodings for cash-flow forecasting.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def create_time_series_features(
    daily_balance_df: pd.DataFrame,
    lags: list[int] = (1, 7, 14, 30, 60, 90),
    rolling_windows: list[int] = (7, 30, 90),
) -> pd.DataFrame:
    """
    Generate lag and rolling features from a daily time series of balances / net burn.
    Expects df with columns: ['date', 'balance', 'net_flow'].
    """
    df = daily_balance_df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df["date"]):
        df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Calendar features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["day_of_month"] = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["is_payday"] = df["day_of_month"].isin([1, 15]).astype(float)
    df["is_month_start"] = (df["day_of_month"] == 1).astype(float)
    df["is_month_end"] = df["date"].dt.is_month_end.astype(float)

    # Cyclical encodings
    df["sin_dow"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["cos_dow"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    df["sin_month"] = np.sin(2 * np.pi * df["month"] / 12)
    df["cos_month"] = np.cos(2 * np.pi * df["month"] / 12)

    # Lag features
    for lag in lags:
        if "balance" in df.columns:
            df[f"balance_lag_{lag}"] = df["balance"].shift(lag)
        if "net_flow" in df.columns:
            df[f"net_flow_lag_{lag}"] = df["net_flow"].shift(lag)

    # Rolling window features
    for window in rolling_windows:
        if "net_flow" in df.columns:
            df[f"rolling_mean_{window}"] = df["net_flow"].shift(1).rolling(window=window, min_periods=1).mean()
            df[f"rolling_std_{window}"] = df["net_flow"].shift(1).rolling(window=window, min_periods=1).std().fillna(0.0)
            df[f"rolling_sum_{window}"] = df["net_flow"].shift(1).rolling(window=window, min_periods=1).sum()

    return df
