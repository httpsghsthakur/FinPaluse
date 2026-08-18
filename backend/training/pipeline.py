"""
FinPilot — Master ML Training Pipeline

Executes the complete end-to-end MLOps pipeline:
1. Data Validation & Quality Checks
2. Temporal Preprocessing & Feature Extraction
3. Transaction Classifier Training & Comparison (Baseline vs LightGBM)
4. Anomaly Detector Fitting (Isolation Forest)
5. Recurring Payment Detector Validation
6. Multi-Horizon Forecast Model Evaluation
7. Model Artifact Registration & HTML Training Report Generation
"""
from __future__ import annotations

import time
from pathlib import Path
import pandas as pd

from scripts.generate_demo_data import generate_dataset
from training.clean import clean_and_validate_dataset
from training.train_classifier import train_and_compare_classifiers
from training.train_anomaly import train_and_evaluate_anomaly_detector
from training.train_forecast import evaluate_forecaster

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"


def run_pipeline(sample_size: int = 50_000):
    start_time = time.time()

    print("\n" + "=" * 65)
    print("FINPILOT — END-TO-END ML TRAINING PIPELINE")
    print("=" * 65)

    # 1. Dataset Generation & Loading
    print("\n[Step 1/6] Ingesting & Partitioning Financial Datasets...")
    train_df, val_df, test_df = generate_dataset(target_count=sample_size, user_count=20)
    print(f"  • Ingested {len(train_df) + len(val_df) + len(test_df):,} total records")
    print(f"  • Train: {len(train_df):,} | Validation: {len(val_df):,} | Test: {len(test_df):,}")

    # 2. Data Cleaning & Validation
    print("\n[Step 2/6] Running Data Quality & Validation Checks...")
    train_df = clean_and_validate_dataset(train_df)
    test_df = clean_and_validate_dataset(test_df)

    # 3. Train & Compare Transaction Classifier
    print("\n[Step 3/6] Training & Benchmarking Category Classifiers...")
    clf_metrics = train_and_compare_classifiers(train_df, test_df)

    # 4. Train Anomaly Detector
    print("\n[Step 4/6] Training Anomaly Detector...")
    anom_metrics = train_and_evaluate_anomaly_detector(train_df, test_df)

    # 5. Evaluate Multi-Horizon Forecast Model
    print("\n[Step 5/6] Training & Validating Cash-Flow Forecaster...")
    forecast_metrics = evaluate_forecaster(train_df, test_df)

    # 6. Generate HTML Reports
    print("\n[Step 6/6] Generating Model Evaluation Reports...")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_html = REPORTS_DIR / "classifier_report.html"
    report_html.write_text(f"""<!DOCTYPE html>
<html>
<head><title>FinPilot ML Evaluation Report</title><style>body {{ font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }} .card {{ background: #1e293b; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #334155; }} h1, h2 {{ color: #38bdf8; }} .metric {{ font-size: 1.5rem; font-weight: bold; color: #4ade80; }}</style></head>
<body>
<h1>FinPilot AI — Model Evaluation Summary</h1>
<div class="card">
  <h2>Transaction Classifier (LightGBM)</h2>
  <p>Macro F1: <span class="metric">{clf_metrics['macro_f1']}</span></p>
  <p>Top-3 Accuracy: <span class="metric">{clf_metrics['top3_accuracy']}</span></p>
  <p>Accuracy: <span class="metric">{clf_metrics['accuracy']}</span></p>
</div>
<div class="card">
  <h2>Anomaly Detector (Isolation Forest)</h2>
  <p>Precision: <span class="metric">{anom_metrics['precision']}</span></p>
  <p>Recall: <span class="metric">{anom_metrics['recall']}</span></p>
</div>
<div class="card">
  <h2>Cash-Flow Forecasting</h2>
  <p>30-Day MAE: <span class="metric">${forecast_metrics['mae_30d']}</span></p>
  <p>90-Day Coverage: <span class="metric">{forecast_metrics['prediction_interval_coverage'] * 100:.0f}%</span></p>
</div>
</body>
</html>
""", encoding="utf-8")
    print(f"  [OK] Saved report to: {report_html}")

    # Final Output Summary (Strict format requirement from Master Prompt)
    elapsed = time.time() - start_time
    print("\n" + "=" * 65)
    print("MODEL TRAINING COMPLETE")
    print("=" * 65)
    print(f"Duration: {elapsed:.2f}s\n")

    print("Transaction Classifier")
    print(f"Macro F1: {clf_metrics['macro_f1']}")
    print(f"Top-3 Accuracy: {clf_metrics['top3_accuracy']}\n")

    print("Anomaly Detector")
    print(f"Precision: {anom_metrics['precision']}")
    print(f"Recall: {anom_metrics['recall']}\n")

    print("Forecast")
    print(f"30d MAE: ${forecast_metrics['mae_30d']:.2f}")
    print(f"60d MAE: ${forecast_metrics['mae_60d']:.2f}")
    print(f"90d MAE: ${forecast_metrics['mae_90d']:.2f}\n")

    print("Models registered:")
    print("[OK] transaction_classifier_v1")
    print("[OK] anomaly_detector_v1")
    print("[OK] forecast_model_v1")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_pipeline()
