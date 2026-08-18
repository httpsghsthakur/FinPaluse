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
        {"id": "cat-housing", "user_id": user_id, "name": "Housing & Rent", "icon": "Home", "color": "#6366F1", "type": "expense", "monthly_budget": 2200, "is_system": True, "is_custom": False},
        {"id": "cat-groceries", "user_id": user_id, "name": "Groceries", "icon": "ShoppingBag", "color": "#3B82F6", "type": "expense", "monthly_budget": 650, "is_system": True, "is_custom": False},
        {"id": "cat-dining", "user_id": user_id, "name": "Dining & Drinks", "icon": "Utensils", "color": "#F59E0B", "type": "expense", "monthly_budget": 450, "is_system": True, "is_custom": False},
        {"id": "cat-transport", "user_id": user_id, "name": "Transport & Auto", "icon": "Car", "color": "#EC4899", "type": "expense", "monthly_budget": 280, "is_system": True, "is_custom": False},
        {"id": "cat-utilities", "user_id": user_id, "name": "Utilities & Bills", "icon": "Zap", "color": "#8B5CF6", "type": "expense", "monthly_budget": 240, "is_system": True, "is_custom": False},
        {"id": "cat-subscriptions", "user_id": user_id, "name": "Subscriptions", "icon": "Layers", "color": "#14B8A6", "type": "expense", "monthly_budget": 180, "is_system": True, "is_custom": False},
        {"id": "cat-entertainment", "user_id": user_id, "name": "Entertainment", "icon": "Film", "color": "#F43F5E", "type": "expense", "monthly_budget": 200, "is_system": True, "is_custom": False},
        {"id": "cat-health", "user_id": user_id, "name": "Health & Fitness", "icon": "Activity", "color": "#10B981", "type": "expense", "monthly_budget": 220, "is_system": True, "is_custom": False},
        {"id": "cat-shopping", "user_id": user_id, "name": "Shopping & Gear", "icon": "Package", "color": "#06B6D4", "type": "expense", "monthly_budget": 400, "is_system": True, "is_custom": False},
        {"id": "cat-transfers", "user_id": user_id, "name": "Transfers & Savings", "icon": "ArrowLeftRight", "color": "#64748B", "type": "transfer", "monthly_budget": 0, "is_system": True, "is_custom": False},
        {"id": "cat-other", "user_id": user_id, "name": "Other Expenses", "icon": "MoreHorizontal", "color": "#94A3B8", "type": "expense", "monthly_budget": 150, "is_system": True, "is_custom": False},
    ]


def generate_accounts(user_id: str) -> list[dict]:
    """Generate accounts matching frontend INITIAL_ACCOUNTS."""
    now_iso = datetime.utcnow().isoformat()
    return [
        {
            "id": "acc-checking", "user_id": user_id,
            "name": "Chase Total Checking", "type": "checking",
            "balance": 8450.25, "currency": "USD",
            "institution": "Chase Bank", "mask": "4821",
            "color": "#3B82F6", "last_synced": now_iso, "is_active": True,
        },
        {
            "id": "acc-savings", "user_id": user_id,
            "name": "Marcus High-Yield Savings (4.75%)", "type": "savings",
            "balance": 34820.50, "currency": "USD",
            "institution": "Goldman Sachs", "mask": "9034",
            "color": "#10B981", "last_synced": now_iso, "is_active": True,
        },
        {
            "id": "acc-credit", "user_id": user_id,
            "name": "American Express Gold Card", "type": "credit",
            "balance": -1340.80, "currency": "USD",
            "institution": "American Express", "mask": "1004",
            "color": "#F59E0B", "last_synced": now_iso, "is_active": True,
        },
    ]


def generate_goals(user_id: str) -> list[dict]:
    """Generate goals matching frontend INITIAL_GOALS."""
    return [
        {
            "id": "goal-1", "user_id": user_id,
            "name": "Emergency Fund (6 Months)",
            "target_amount": 40000, "current_amount": 34820,
            "deadline": "2026-12-31", "category": "Safety",
            "linked_account_id": "acc-savings",
            "monthly_contribution": 800, "color": "#10B981",
            "icon": "ShieldCheck", "is_completed": False,
            "boost_suggestion": "Move $80/mo from Dining to hit this 1.5 months earlier.",
        },
        {
            "id": "goal-2", "user_id": user_id,
            "name": "Tokyo Autumn Trip",
            "target_amount": 4500, "current_amount": 3450,
            "deadline": "2026-10-20", "category": "Travel",
            "linked_account_id": "acc-checking",
            "monthly_contribution": 450, "color": "#6366F1",
            "icon": "Plane", "is_completed": False,
            "boost_suggestion": "Cancel 2 unused subscriptions to reach target by September.",
        },
        {
            "id": "goal-3", "user_id": user_id,
            "name": "New MacBook Pro M4",
            "target_amount": 2800, "current_amount": 2450,
            "deadline": "2026-09-30", "category": "Gear",
            "linked_account_id": "acc-checking",
            "monthly_contribution": 350, "color": "#06B6D4",
            "icon": "Laptop", "is_completed": False,
        },
        {
            "id": "goal-4", "user_id": user_id,
            "name": "Home Down Payment (20%)",
            "target_amount": 120000, "current_amount": 48500,
            "deadline": "2028-06-30", "category": "Real Estate",
            "linked_account_id": "acc-savings",
            "monthly_contribution": 1500, "color": "#F59E0B",
            "icon": "Home", "is_completed": False,
            "boost_suggestion": "Automate $200 from monthly freelance surplus directly to Marcus HYSA.",
        },
    ]


def generate_insights(user_id: str) -> list[dict]:
    """Generate insights matching frontend INITIAL_INSIGHTS."""
    today = date.today()
    return [
        {
            "id": "ins-1", "user_id": user_id,
            "title": "Dining spending pacing 24% over budget",
            "description": "You have spent $398 of your $450 dining budget with 12 days left in the billing cycle.",
            "severity": "warning", "type": "alert",
            "date": (today - timedelta(days=1)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Detected 14 transactions at coffee shops and restaurants totaling $398. Your average daily burn rate in Dining is $22.11 vs budgeted $15.00.",
            "grounded_data": [
                {"label": "Current Dining Spend", "value": "$398.00"},
                {"label": "Monthly Limit", "value": "$450.00"},
                {"label": "Projected Overage", "value": "$112.50"},
                {"label": "Top Merchant", "value": "Sweetgreen ($84.20)"},
            ],
            "action_label": "Adjust Dining Budget",
            "action_path": "/app/budgets",
        },
        {
            "id": "ins-2", "user_id": user_id,
            "title": "High-Yield Savings earned $138.40 interest",
            "description": "Your Marcus HYSA balance of $34,820 generated a monthly yield at 4.75% APY.",
            "severity": "success", "type": "win",
            "date": (today - timedelta(days=3)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Calculated from 30-day compound interest rate across your liquid cash balance.",
            "grounded_data": [
                {"label": "APY Rate", "value": "4.75%"},
                {"label": "Monthly Gain", "value": "+$138.40"},
                {"label": "Annualized Passive Return", "value": "$1,654.00"},
            ],
            "action_label": "View HYSA Balance",
            "action_path": "/app/forecast",
        },
        {
            "id": "ins-3", "user_id": user_id,
            "title": "Unusual transaction flagged: Apple Store $489.00",
            "description": "This transaction is 3.4x higher than your typical shopping transaction of $142.00.",
            "severity": "alert", "type": "alert",
            "date": (today - timedelta(days=4)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "AI anomaly detection model evaluates 180-day baseline per merchant category. 98th percentile spend spike detected on Amex Gold card.",
            "grounded_data": [
                {"label": "Merchant", "value": "Apple Store NYC"},
                {"label": "Amount", "value": "$489.00"},
                {"label": "Typical Category Avg", "value": "$142.00"},
                {"label": "Account", "value": "Amex Gold (1004)"},
            ],
            "action_label": "Inspect Transaction",
            "action_path": "/app/transactions",
        },
        {
            "id": "ins-4", "user_id": user_id,
            "title": "Upcoming quarterly insurance bill in 9 days",
            "description": "State Farm Auto Insurance ($324.50) is scheduled to be debited on Chase Checking.",
            "severity": "info", "type": "tip",
            "date": (today - timedelta(days=2)).isoformat(),
            "is_dismissed": False,
            "why_explanation": "Identified recurring quarterly frequency matching past payments in February, May, and August.",
            "grounded_data": [
                {"label": "Amount Due", "value": "$324.50"},
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
            {"name": "Whole Foods Market", "min": 45, "max": 180, "account": "acc-credit"},
            {"name": "Trader Joe's", "min": 35, "max": 110, "account": "acc-credit"},
            {"name": "Costco Wholesale", "min": 120, "max": 320, "account": "acc-checking"},
            {"name": "Safeway", "min": 25, "max": 85, "account": "acc-credit"},
            {"name": "Local Farmers Market", "min": 20, "max": 65, "account": "acc-checking"},
        ],
        "cat-dining": [
            {"name": "Blue Bottle Coffee", "min": 6.5, "max": 14.5, "account": "acc-credit"},
            {"name": "Sweetgreen", "min": 14, "max": 24, "account": "acc-credit"},
            {"name": "Chipotle Mexican Grill", "min": 12, "max": 22, "account": "acc-credit"},
            {"name": "Tartine Bakery", "min": 15, "max": 35, "account": "acc-credit"},
            {"name": "Nobu Japanese Cuisine", "min": 140, "max": 280, "account": "acc-credit"},
            {"name": "Local Trattoria", "min": 45, "max": 110, "account": "acc-credit"},
            {"name": "Shake Shack", "min": 16, "max": 28, "account": "acc-credit"},
        ],
        "cat-transport": [
            {"name": "Uber Trips", "min": 15, "max": 45, "account": "acc-credit"},
            {"name": "Lyft Ride", "min": 14, "max": 38, "account": "acc-credit"},
            {"name": "Chevron Gas Station", "min": 45, "max": 68, "account": "acc-credit"},
            {"name": "Metropolitan Transit Authority", "min": 34, "max": 34, "account": "acc-checking"},
        ],
        "cat-shopping": [
            {"name": "Amazon.com", "min": 22, "max": 140, "account": "acc-credit"},
            {"name": "Apple Store NYC", "min": 150, "max": 489, "account": "acc-credit"},
            {"name": "Target", "min": 30, "max": 120, "account": "acc-credit"},
            {"name": "Uniqlo App", "min": 40, "max": 110, "account": "acc-credit"},
            {"name": "REI Co-op", "min": 65, "max": 210, "account": "acc-credit"},
        ],
        "cat-entertainment": [
            {"name": "AMC Theatres", "min": 28, "max": 45, "account": "acc-credit"},
            {"name": "Steam Games", "min": 15, "max": 60, "account": "acc-credit"},
            {"name": "Live Nation Concerts", "min": 85, "max": 180, "account": "acc-credit"},
            {"name": "Audible Audiobooks", "min": 15, "max": 15, "account": "acc-credit"},
        ],
        "cat-health": [
            {"name": "CVS Pharmacy", "min": 12, "max": 45, "account": "acc-credit"},
            {"name": "Equinox Fitness Club", "min": 220, "max": 220, "account": "acc-checking"},
            {"name": "CorePower Yoga", "min": 35, "max": 35, "account": "acc-credit"},
        ],
        "cat-utilities": [
            {"name": "Pacific Gas & Electric", "min": 85, "max": 145, "account": "acc-checking"},
            {"name": "Verizon Wireless", "min": 85, "max": 95, "account": "acc-checking"},
            {"name": "Sonic Fiber Internet", "min": 65, "max": 65, "account": "acc-checking"},
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
            "date": d1, "merchant": "Acme Corp Direct Deposit",
            "category_id": "cat-income", "account_id": "acc-checking",
            "amount": 3850.00, "status": "settled", "is_recurring": True,
            "notes": "Bi-weekly tech engineering payroll",
        })
        transactions.append({
            "id": f"tx-sal-{month_offset}-2", "user_id": user_id,
            "date": d2, "merchant": "Acme Corp Direct Deposit",
            "category_id": "cat-income", "account_id": "acc-checking",
            "amount": 3850.00, "status": "settled", "is_recurring": True,
            "notes": "Bi-weekly tech engineering payroll",
        })

        # Freelance income (alternate months)
        if month_offset % 2 == 0:
            transactions.append({
                "id": f"tx-free-{month_offset}", "user_id": user_id,
                "date": (month_date - timedelta(days=7)).isoformat(),
                "merchant": "Stripe Payout - UI Consultancy",
                "category_id": "cat-income", "account_id": "acc-checking",
                "amount": 1450.00 + int(rng() * 600),
                "status": "settled", "is_recurring": False,
                "notes": "Design system consulting milestone",
            })

        # Rent
        transactions.append({
            "id": f"tx-rent-{month_offset}", "user_id": user_id,
            "date": (month_date - timedelta(days=28)).isoformat(),
            "merchant": "Avalon Bay Communities Rent",
            "category_id": "cat-housing", "account_id": "acc-checking",
            "amount": -2100.00, "status": "settled", "is_recurring": True,
            "notes": "Monthly 1BR apartment lease",
        })

        # Subscriptions
        subs = [
            ("Netflix Premium 4K", -22.99, "cat-subscriptions"),
            ("Spotify Duo", -14.99, "cat-subscriptions"),
            ("ChatGPT Plus Subscription", -20.00, "cat-subscriptions"),
            ("GitHub Copilot Pro", -10.00, "cat-subscriptions"),
            ("iCloud 2TB Storage", -9.99, "cat-subscriptions"),
            ("Equinox Gym Membership", -220.00, "cat-health"),
            ("Notion Plus Workspace", -10.00, "cat-subscriptions"),
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
            "merchant": "Marcus Interest Paid (4.75%)",
            "category_id": "cat-income", "account_id": "acc-savings",
            "amount": round(135.00 + rng() * 10, 2),
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

            is_anomaly = rounded_amount < -350 and chosen_cat in ("cat-shopping", "cat-dining")
            anomaly_reason = None
            if is_anomaly:
                anomaly_reason = f"Spike alert: {abs(rounded_amount):.0f} is ~3.2x higher than typical {chosen_cat.replace('cat-', '')} expense."

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


def generate_user(user_id: str) -> dict:
    """Generate the demo user matching frontend DEFAULT_PROFILE."""
    return {
        "id": user_id,
        "email": "alex.morgan@finpilot.ai",
        "name": "Alex Morgan",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "currency": "USD",
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
