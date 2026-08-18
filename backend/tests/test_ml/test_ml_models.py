"""
FinPilot — Machine Learning & Intelligence Models Test Suite
"""
import pytest
import pandas as pd
import numpy as np

from app.ml.classifiers.ensemble import PersonalizedEnsembleClassifier
from app.ml.anomaly.anomaly_detector import AnomalyDetector
from app.ml.recurring.recurring_detector import RecurringPaymentDetector
from app.ml.goals.goal_engine import GoalProjectionEngine
from app.ai.rag.chunking import DocumentChunker
from app.ai.rag.retriever import HybridRetriever


def test_personalized_ensemble_classifier():
    classifier = PersonalizedEnsembleClassifier()

    # 1. Rule / Keyword matching
    res1 = classifier.classify("Whole Foods Market NYC", -85.50)
    assert res1["category_id"] == "cat-groceries"
    assert res1["confidence"] >= 0.70

    res2 = classifier.classify("Sweetgreen Salad", -18.20)
    assert res2["category_id"] == "cat-dining"

    # 2. User Personalized Override
    classifier.set_user_corrections([{
        "user_id": "user-123",
        "merchant": "amazon.com",
        "new_category_id": "cat-groceries",
    }])

    res_override = classifier.classify("Amazon.com", -45.0, user_id="user-123")
    assert res_override["category_id"] == "cat-groceries"
    assert res_override["confidence"] == 0.99
    assert res_override["model_source"] == "user_personalized_rule"


def test_anomaly_detector():
    detector = AnomalyDetector(contamination=0.03)

    # Train with typical baseline
    training_data = pd.DataFrame([
        {"amount": -25.0, "category_id": "cat-dining", "merchant": "Chipotle"},
        {"amount": -30.0, "category_id": "cat-dining", "merchant": "Sweetgreen"},
        {"amount": -22.0, "category_id": "cat-dining", "merchant": "Shake Shack"},
        {"amount": -35.0, "category_id": "cat-dining", "merchant": "Trattoria"},
        {"amount": -28.0, "category_id": "cat-dining", "merchant": "Bakery"},
    ] * 20)

    detector.fit(training_data)

    # Normal transaction
    normal_score = detector.score_transaction(amount=-28.0, category_id="cat-dining")
    assert normal_score["is_anomaly"] is False

    # Massive spike anomaly
    anomaly_score = detector.score_transaction(amount=-850.0, category_id="cat-dining")
    assert anomaly_score["is_anomaly"] is True
    assert anomaly_score["deviation_factor"] >= 10.0
    assert "higher than your typical" in anomaly_score["explanation"]


def test_recurring_payment_detector():
    detector = RecurringPaymentDetector()

    # Synthetic monthly subscription
    df = pd.DataFrame([
        {"merchant": "Netflix", "amount": -22.99, "date": "2026-05-04", "category_id": "cat-subscriptions", "account_id": "acc-credit"},
        {"merchant": "Netflix", "amount": -22.99, "date": "2026-06-04", "category_id": "cat-subscriptions", "account_id": "acc-credit"},
        {"merchant": "Netflix", "amount": -22.99, "date": "2026-07-04", "category_id": "cat-subscriptions", "account_id": "acc-credit"},
        {"merchant": "Random Coffee", "amount": -6.50, "date": "2026-07-01", "category_id": "cat-dining", "account_id": "acc-credit"},
    ])

    results = detector.detect_recurring(df)
    assert len(results) >= 1
    netflix = next(r for r in results if r["merchant"] == "Netflix")
    assert netflix["frequency"] == "monthly"
    assert netflix["expected_amount"] == 22.99
    assert netflix["confidence"] >= 0.85


def test_goal_projection_engine():
    engine = GoalProjectionEngine()

    res = engine.evaluate_goal(
        target_amount=10000.0,
        current_amount=4000.0,
        monthly_contribution=500.0,
        deadline_date_str="2027-08-18",
    )

    assert res["is_completed"] is False
    assert res["months_to_complete"] == 12
    assert "projected_completion_date" in res
    assert "boost_suggestion" in res


def test_rag_chunking_and_retrieval():
    chunker = DocumentChunker(chunk_size_words=50, overlap_words=10)
    text = (
        "Apple Inc. designs and markets consumer electronics and cloud services. "
        "During fiscal year 2026, total services revenue grew by 14 percent driven by App Store and Apple Pay subscriptions. "
        "Operating cash flows exceeded 110 billion dollars."
    )

    chunks = chunker.chunk_document(
        document_id="doc_aapl_10k",
        text=text,
        doc_metadata={"company": "Apple Inc.", "ticker": "AAPL", "source": "SEC EDGAR"},
    )
    assert len(chunks) >= 1
    assert chunks[0]["company"] == "Apple Inc."

    retriever = HybridRetriever()
    retriever.index_chunks(chunks)

    search_res = retriever.search("services revenue growth Apple")
    assert len(search_res) >= 1
    assert "Apple" in search_res[0]["content"]
