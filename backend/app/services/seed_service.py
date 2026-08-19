"""
FinPilot — Seed Data Service

Generates demo data matching the frontend's seed data exactly,
so the transition from USE_MOCK=true to USE_MOCK=false is seamless.
"""
from __future__ import annotations

import uuid
import math
import random
from datetime import datetime, date, timedelta
from typing import Any


def _seeded_random(seed: int = 42):
    """Deterministic PRNG matching frontend's seededRandom()."""
    s = seed % 2147483647
    if s <= 0:
        s += 2147483646

    def _next():
        nonlocal s
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646

    return _next


def generate_demo_user_id() -> str:
    """Generate the default demo user UUID."""
    return "00000000-0000-4000-a000-000000000001"


DEMO_USER_ID = generate_demo_user_id()


def generate_categories(user_id: str) -> list[dict]:
    """Generate categories matching frontend INITIAL_CATEGORIES."""
    return [
        {"id": "cat-income", "user_id": user_id, "name": "Income", "icon": "Wallet", "color": "#10B981", "type": "income", "monthly_budget": 0, "is_system": True, "is_custom": False},
        {"id": "cat-housing", "user_id": user_id, "name": "Housing & Rent", "icon": "Home", "color": "#6366F1", "type": "expense", "monthly_budget": 25000, "is_system": True, "is_custom": False},
        {"id": "cat-groceries", "user_id": user_id, "name": "Groceries", "icon": "ShoppingBag", "color": "#3B82F6", "type": "expense", "monthly_budget": 12000, "is_system": True, "is_custom": False},
        {"id": "cat-dining", "user_id": user_id, "name": "Dining & Drinks", "icon": "Utensils", "color": "#F59E0B", "type": "expense", "monthly_budget": 8000, "is_system": True, "is_custom": False},
        {"id": "cat-transport", "user_id": user_id, "name": "Transport & Auto", "icon": "Car", "color": "#EC4899", "type": "expense", "monthly_budget": 5000, "is_system": True, "is_custom": False},
        {"id": "cat-utilities", "user_id": user_id, "name": "Utilities & Bills", "icon": "Zap", "color": "#8B5CF6", "type": "expense", "monthly_budget": 4500, "is_system": True, "is_custom": False},
        {"id": "cat-subscriptions", "user_id": user_id, "name": "Subscriptions", "icon": "Layers", "color": "#14B8A6", "type": "expense", "monthly_budget": 2500, "is_system": True, "is_custom": False},
        {"id": "cat-entertainment", "user_id": user_id, "name": "Entertainment", "icon": "Film", "color": "#F43F5E", "type": "expense", "monthly_budget": 4000, "is_system": True, "is_custom": False},
        {"id": "cat-health", "user_id": user_id, "name": "Health & Fitness", "icon": "Activity", "color": "#10B981", "type": "expense", "monthly_budget": 3000, "is_system": True, "is_custom": False},
        {"id": "cat-shopping", "user_id": user_id, "name": "Shopping & Gear", "icon": "Package", "color": "#06B6D4", "type": "expense", "monthly_budget": 8000, "is_system": True, "is_custom": False},
        {"id": "cat-transfers", "user_id": user_id, "name": "Transfers & Savings", "icon": "ArrowLeftRight", "color": "#64748B", "type": "transfer", "monthly_budget": 0, "is_system": True, "is_custom": False},
        {"id": "cat-other", "user_id": user_id, "name": "Other Expenses", "icon": "MoreHorizontal", "color": "#94A3B8", "type": "expense", "monthly_budget": 5000, "is_system": True, "is_custom": False},
    ]


def generate_accounts(user_id: str) -> list[dict]:
    """Generate accounts matching frontend INITIAL_ACCOUNTS."""
    now_iso = datetime.utcnow().isoformat()
    return [
        {
            "id": "acc-checking", "user_id": user_id,
            "name": "HDFC Salary Account", "type": "checking",
            "balance": 245000.25, "currency": "INR",
            "institution": "HDFC Bank", "mask": "4821",
            "color": "#3B82F6", "last_synced": now_iso, "is_active": True,
        },
        {
            "id": "acc-savings", "user_id": user_id,
            "name": "SBI Fixed Deposit (7.1%)", "type": "savings",
            "balance": 1500000.50, "currency": "INR",
            "institution": "State Bank of India", "mask": "9034",
            "color": "#10B981", "last_synced": now_iso, "is_active": True,
        },
        {
            "id": "acc-credit", "user_id": user_id,
            "name": "ICICI Amazon Pay Credit Card", "type": "credit",
            "balance": -45400.80, "currency": "INR",
            "institution": "ICICI Bank", "mask": "1004",
            "color": "#F59E0B", "last_synced": now_iso, "is_active": True,
        },
    ]


def generate_goals(user_id: str) -> list[dict]:
    """Generate goals matching frontend INITIAL_GOALS."""
    return [
        {
            "id": "goal-1", "user_id": user_id,
            "name": "Emergency Fund (6 Months)",
            "target_amount": 600000, "current_amount": 420000,
            "deadline": "2026-12-31", "category": "Safety",
            "linked_account_id": "acc-savings",
            "monthly_contribution": 15000, "color": "#10B981",
            "icon": "ShieldCheck", "is_completed": False,
            "boost_suggestion": "Move ₹2,000/mo from Dining to hit this 1.5 months earlier.",
        },
        {
            "id": "goal-2", "user_id": user_id,
            "name": "Bali Vacation",
            "target_amount": 120000, "current_amount": 45000,
            "deadline": "2026-10-20", "category": "Travel",
            "linked_account_id": "acc-checking",
            "monthly_contribution": 15000, "color": "#6366F1",
            "icon": "Plane", "is_completed": False,
            "boost_suggestion": "Cancel 2 unused subscriptions to reach target by September.",
        },
        {
            "id": "goal-3", "user_id": user_id,
            "name": "New MacBook Pro M4",
            "target_amount": 180000, "current_amount": 120000,
            "deadline": "2026-09-30", "category": "Gear",
            "linked_account_id": "acc-checking",
            "monthly_contribution": 20000, "color": "#06B6D4",
            "icon": "Laptop", "is_completed": False,
        },
        {
            "id": "goal-4", "user_id": user_id,
            "name": "Home Down Payment",
            "target_amount": 2500000, "current_amount": 1050000,
            "deadline": "2028-06-30", "category": "Real Estate",
            "linked_account_id": "acc-savings",
            "monthly_contribution": 40000, "color": "#F59E0B",
            "icon": "Home", "is_completed": False,
            "boost_suggestion": "Automate ₹5,000 from monthly freelance surplus directly to FD.",
        },
    ]


def generate_insights(user_id: str) -> list[dict]:
    """Generate insights matching frontend INITIAL_INSIGHTS."""
    today = date.today()
    return [
        {
            "id": "ins-1", "user_id": user_id,
            "title": "Dining spending pacing 24% over budget",
            "description": "You have spent ₹6,500 of your ₹8,000 dining budget with 12 days left in the billing cycle.",
            "severity": "warning", "type": "alert",
            "date": (today - timedelta(days=1)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Detected 14 transactions at coffee shops and restaurants totaling ₹6,500. Your average daily burn rate in Dining is ₹361 vs budgeted ₹266.",
            "grounded_data": [
                {"label": "Current Dining Spend", "value": "₹6,500"},
                {"label": "Monthly Limit", "value": "₹8,000"},
                {"label": "Projected Overage", "value": "₹2,830"},
                {"label": "Top Merchant", "value": "Rameshwaram Cafe (₹1,400)"},
            ],
            "action_label": "Adjust Dining Budget",
            "action_path": "/app/budgets",
        },
        {
            "id": "ins-2", "user_id": user_id,
            "title": "Fixed Deposit earned ₹8,875 interest",
            "description": "Your SBI Fixed Deposit balance of ₹15,00,000 generated a monthly yield at 7.1% interest.",
            "severity": "success", "type": "win",
            "date": (today - timedelta(days=3)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Calculated from 30-day compound interest rate across your liquid savings.",
            "grounded_data": [
                {"label": "Interest Rate", "value": "7.1%"},
                {"label": "Monthly Gain", "value": "+₹8,875"},
                {"label": "Annualized Passive Return", "value": "₹1,06,500"},
            ],
            "action_label": "View Savings Balance",
            "action_path": "/app/forecast",
        },
        {
            "id": "ins-3", "user_id": user_id,
            "title": "Unusual transaction flagged: Chroma Store ₹45,000",
            "description": "This transaction is 4x higher than your typical shopping transaction of ₹10,500.",
            "severity": "alert", "type": "alert",
            "date": (today - timedelta(days=4)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "AI anomaly detection model evaluates 180-day baseline per merchant category. 98th percentile spend spike detected on ICICI Credit card.",
            "grounded_data": [
                {"label": "Merchant", "value": "Chroma Electronics"},
                {"label": "Amount", "value": "₹45,000"},
                {"label": "Typical Category Avg", "value": "₹10,500"},
                {"label": "Account", "value": "ICICI Amazon Pay (1004)"},
            ],
            "action_label": "Inspect Transaction",
            "action_path": "/app/transactions",
        },
        {
            "id": "ins-4", "user_id": user_id,
            "title": "Upcoming quarterly insurance bill in 9 days",
            "description": "HDFC Ergo Health Insurance (₹12,450) is scheduled to be debited on HDFC Checking.",
            "severity": "info", "type": "tip",
            "date": (today - timedelta(days=2)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Identified recurring quarterly frequency matching past payments in February, May, and August.",
            "grounded_data": [
                {"label": "Amount Due", "value": "₹12,450"},
                {"label": "Due Date", "value": (today + timedelta(days=9)).strftime("%b %d, %Y")},
                {"label": "Post-Debit Runway", "value": "7.4 Months"},
            ],
            "action_label": "Check Cash Flow",
            "action_path": "/app/forecast",
        },
    ]


def generate_transactions(user_id: str) -> list[dict]:
    """Generate transactions matching the frontend seed data pattern."""
    rng = _seeded_random(42)
    today = date.today()
    transactions: list[dict] = []

    merchants_by_category = {
        "cat-groceries": [
            {"name": "Reliance Fresh", "min": 1500, "max": 4500, "account": "acc-credit"},
            {"name": "Nature's Basket", "min": 800, "max": 2500, "account": "acc-credit"},
            {"name": "DMart", "min": 2500, "max": 7000, "account": "acc-checking"},
            {"name": "Blinkit", "min": 300, "max": 1200, "account": "acc-credit"},
            {"name": "Local Farmers Market", "min": 200, "max": 800, "account": "acc-checking"},
        ],
        "cat-dining": [
            {"name": "Third Wave Coffee", "min": 350, "max": 850, "account": "acc-credit"},
            {"name": "Rameshwaram Cafe", "min": 250, "max": 600, "account": "acc-credit"},
            {"name": "Truffles", "min": 800, "max": 1800, "account": "acc-credit"},
            {"name": "Zomato", "min": 300, "max": 1200, "account": "acc-credit"},
            {"name": "Bukhara", "min": 4500, "max": 9500, "account": "acc-credit"},
            {"name": "Local Dhaba", "min": 150, "max": 400, "account": "acc-credit"},
            {"name": "Burger King", "min": 250, "max": 500, "account": "acc-credit"},
        ],
        "cat-transport": [
            {"name": "Uber Trips", "min": 150, "max": 800, "account": "acc-credit"},
            {"name": "Ola Cabs", "min": 120, "max": 650, "account": "acc-credit"},
            {"name": "Shell Petrol", "min": 1500, "max": 3500, "account": "acc-credit"},
            {"name": "Namma Metro", "min": 50, "max": 150, "account": "acc-checking"},
        ],
        "cat-shopping": [
            {"name": "Amazon India", "min": 500, "max": 6500, "account": "acc-credit"},
            {"name": "Chroma Store", "min": 5000, "max": 45000, "account": "acc-credit"},
            {"name": "Myntra", "min": 800, "max": 4500, "account": "acc-credit"},
            {"name": "Nykaa", "min": 600, "max": 3500, "account": "acc-credit"},
            {"name": "Decathlon", "min": 1200, "max": 4500, "account": "acc-credit"},
        ],
        "cat-entertainment": [
            {"name": "BookMyShow", "min": 400, "max": 1200, "account": "acc-credit"},
            {"name": "Steam Games", "min": 350, "max": 2500, "account": "acc-credit"},
            {"name": "Live Nation Concerts", "min": 1500, "max": 4500, "account": "acc-credit"},
            {"name": "Audible Audiobooks", "min": 199, "max": 199, "account": "acc-credit"},
        ],
        "cat-health": [
            {"name": "Apollo Pharmacy", "min": 250, "max": 1500, "account": "acc-credit"},
            {"name": "CureFit Cult", "min": 1500, "max": 2500, "account": "acc-checking"},
            {"name": "1mg", "min": 400, "max": 1200, "account": "acc-credit"},
        ],
        "cat-utilities": [
            {"name": "BESCOM Electricity", "min": 1200, "max": 2500, "account": "acc-checking"},
            {"name": "Airtel Postpaid", "min": 499, "max": 999, "account": "acc-checking"},
            {"name": "JioFiber Broadband", "min": 999, "max": 1499, "account": "acc-checking"},
        ],
    }

    tx_counter = 1

    for month_offset in range(5, -1, -1):
        month_date = today - timedelta(days=month_offset * 30)

        # Salary (1st and 15th)
        d1 = (month_date - timedelta(days=14)).isoformat()
        d2 = month_date.isoformat()

        transactions.append({
            "id": f"tx-sal-{month_offset}-1", "user_id": user_id,
            "date": d1, "merchant": "TechCorp India Pvt Ltd",
            "category_id": "cat-income", "account_id": "acc-checking",
            "amount": 47500.00, "status": "settled", "is_recurring": True,
            "notes": "Bi-weekly tech engineering payroll",
        })
        transactions.append({
            "id": f"tx-sal-{month_offset}-2", "user_id": user_id,
            "date": d2, "merchant": "TechCorp India Pvt Ltd",
            "category_id": "cat-income", "account_id": "acc-checking",
            "amount": 47500.00, "status": "settled", "is_recurring": True,
            "notes": "Bi-weekly tech engineering payroll",
        })

        # Freelance income (alternate months)
        if month_offset % 2 == 0:
            transactions.append({
                "id": f"tx-free-{month_offset}", "user_id": user_id,
                "date": (month_date - timedelta(days=7)).isoformat(),
                "merchant": "Razorpay Payout - UI Consultancy",
                "category_id": "cat-income", "account_id": "acc-checking",
                "amount": 25000.00 + int(rng() * 15000),
                "status": "settled", "is_recurring": False,
                "notes": "Design system consulting milestone",
            })

        # Rent
        transactions.append({
            "id": f"tx-rent-{month_offset}", "user_id": user_id,
            "date": (month_date - timedelta(days=28)).isoformat(),
            "merchant": "Prestige Apartments Rent",
            "category_id": "cat-housing", "account_id": "acc-checking",
            "amount": -25000.00, "status": "settled", "is_recurring": True,
            "notes": "Monthly 1BR apartment lease",
        })

        # Subscriptions
        subs = [
            ("Netflix Premium", -649.00, "cat-subscriptions"),
            ("Spotify Premium", -119.00, "cat-subscriptions"),
            ("Hotstar VIP", -899.00, "cat-subscriptions"),
            ("GitHub Copilot", -830.00, "cat-subscriptions"),
            ("Swiggy One", -299.00, "cat-subscriptions"),
            ("CureFit Membership", -1500.00, "cat-health"),
            ("Amazon Prime", -1499.00, "cat-subscriptions"),
        ]
        for s_idx, (s_name, s_amount, s_cat) in enumerate(subs):
            transactions.append({
                "id": f"tx-sub-{month_offset}-{s_idx}", "user_id": user_id,
                "date": (month_date - timedelta(days=20 - s_idx * 2)).isoformat(),
                "merchant": s_name, "category_id": s_cat,
                "account_id": "acc-credit", "amount": s_amount,
                "status": "settled", "is_recurring": True,
            })

        # Interest
        transactions.append({
            "id": f"tx-interest-{month_offset}", "user_id": user_id,
            "date": (month_date - timedelta(days=1)).isoformat(),
            "merchant": "SBI FD Interest Paid (7.1%)",
            "category_id": "cat-income", "account_id": "acc-savings",
            "amount": round(8875.00 + rng() * 100, 2),
            "status": "settled", "is_recurring": True,
        })

        # Variable expenses
        cats = list(merchants_by_category.keys())
        for day in range(0, 30, 2):
            tx_date = (month_date - timedelta(days=day)).isoformat()
            chosen_cat = cats[int(rng() * len(cats)) % len(cats)]
            merchant_list = merchants_by_category[chosen_cat]
            merchant = merchant_list[int(rng() * len(merchant_list)) % len(merchant_list)]

            raw_amount = merchant["min"] + rng() * (merchant["max"] - merchant["min"])
            rounded_amount = -round(raw_amount, 2)

            is_anomaly = rounded_amount < -15000 and chosen_cat in ("cat-shopping", "cat-dining")
            anomaly_reason = None
            if is_anomaly:
                anomaly_reason = f"Spike alert: ₹{abs(rounded_amount):.0f} is ~3.2x higher than typical {chosen_cat.replace('cat-', '')} expense."

            transactions.append({
                "id": f"tx-var-{tx_counter}", "user_id": user_id,
                "date": tx_date, "merchant": merchant["name"],
                "category_id": chosen_cat, "account_id": merchant["account"],
                "amount": rounded_amount, "status": "settled",
                "is_recurring": False, "is_anomaly": is_anomaly,
                "anomaly_reason": anomaly_reason,
            })
            tx_counter += 1

    # Sort by date descending
    transactions.sort(key=lambda t: t["date"], reverse=True)
    return transactions


def generate_recurring(user_id: str) -> list[dict]:
    """Generate recurring transactions (bills, subscriptions, salary) for the demo user."""
    today = datetime.now()
    
    return [
        {
            "id": "rec-rent",
            "user_id": user_id,
            "merchant": "Prestige Apartments Rent",
            "category_id": "cat-housing",
            "account_id": "acc-checking",
            "is_recurring": True,
            "frequency": "monthly",
            "expected_amount": -25000.0,
            "amount_variance": 0.0,
            "expected_next_date": (today.replace(day=1) + timedelta(days=32)).replace(day=1).date().isoformat(),
            "confidence": 0.99,
            "last_seen_date": today.replace(day=1).date().isoformat(),
            "occurrence_count": 12,
            "is_active": True,
        },
        {
            "id": "rec-gym",
            "user_id": user_id,
            "merchant": "CureFit Membership",
            "category_id": "cat-health",
            "account_id": "acc-checking",
            "is_recurring": True,
            "frequency": "monthly",
            "expected_amount": -1500.0,
            "amount_variance": 0.0,
            "expected_next_date": (today + timedelta(days=6)).date().isoformat(),
            "confidence": 0.95,
            "last_seen_date": (today - timedelta(days=24)).date().isoformat(),
            "occurrence_count": 6,
            "is_active": True,
        },
        {
            "id": "rec-internet",
            "user_id": user_id,
            "merchant": "JioFiber Broadband",
            "category_id": "cat-utilities",
            "account_id": "acc-checking",
            "is_recurring": True,
            "frequency": "monthly",
            "expected_amount": -1499.0,
            "amount_variance": 0.0,
            "expected_next_date": (today + timedelta(days=4)).date().isoformat(),
            "confidence": 0.98,
            "last_seen_date": (today - timedelta(days=26)).date().isoformat(),
            "occurrence_count": 24,
            "is_active": True,
        },
        {
            "id": "rec-netflix",
            "user_id": user_id,
            "merchant": "Netflix Premium",
            "category_id": "cat-subscriptions",
            "account_id": "acc-credit",
            "is_recurring": True,
            "frequency": "monthly",
            "expected_amount": -649.00,
            "amount_variance": 0.0,
            "expected_next_date": (today + timedelta(days=8)).date().isoformat(),
            "confidence": 0.98,
            "last_seen_date": (today - timedelta(days=22)).date().isoformat(),
            "occurrence_count": 18,
            "is_active": True,
        },
        {
            "id": "rec-salary",
            "user_id": user_id,
            "merchant": "TechCorp India Pvt Ltd",
            "category_id": "cat-income",
            "account_id": "acc-checking",
            "is_recurring": True,
            "frequency": "biweekly",
            "expected_amount": 47500.0,
            "amount_variance": 0.0,
            "expected_next_date": (today + timedelta(days=2)).date().isoformat(),
            "confidence": 0.99,
            "last_seen_date": (today - timedelta(days=12)).date().isoformat(),
            "occurrence_count": 48,
            "is_active": True,
        }
    ]


def generate_user(user_id: str) -> dict:
    """Generate the demo user matching frontend DEFAULT_PROFILE."""
    return {
        "id": user_id,
        "email": "alex.morgan@finpilot.ai",
        "name": "Alex Morgan",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "currency": "INR",
        "theme": "dark",
        "first_day_of_month": 1,
        "notifications_enabled": True,
        "chat_personality": "balanced",
        "share_data_for_analytics": True,
        "is_2fa_enabled": False,
        "pin_code": "4829",
        "consent_personalization": True,
        "consent_global_training": False,
    }
