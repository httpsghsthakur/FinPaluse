# FinPilot Backend

## Quick Start

### Option 1: Docker (Recommended)

```bash
cd backend

# Start PostgreSQL + Redis + Backend
docker-compose up -d

# The API will be available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Option 2: Local Development

**Prerequisites:**
- Python 3.12+
- PostgreSQL 16+ running locally
- Redis running locally

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env with your database credentials

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Connect Frontend

In the frontend's `src/lib/api/config.ts`, set:

```typescript
export const API_CONFIG = {
  USE_MOCK: false,
  BASE_URL: 'http://localhost:8000/api/v1',
  // ...
};
```

Or set the environment variable:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Architecture

```
Database → Deterministic Calculations → ML Predictions → Retrieved Sources → LLM Explanation
```

The LLM NEVER invents financial numbers. Every figure originates from database queries and deterministic calculations.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | List accounts |
| POST | `/api/v1/accounts` | Connect account |
| POST | `/api/v1/accounts/{id}/sync` | Sync account |
| DELETE | `/api/v1/accounts/{id}` | Disconnect account |
| GET | `/api/v1/transactions` | List transactions (filtered, paginated) |
| POST | `/api/v1/transactions` | Add transaction |
| PATCH | `/api/v1/transactions/{id}` | Update transaction |
| POST | `/api/v1/transactions/import` | Import CSV |
| GET | `/api/v1/transactions/export` | Export CSV |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/categories` | Add category |
| PATCH | `/api/v1/categories/{id}` | Update category |
| DELETE | `/api/v1/categories/{id}` | Delete category |
| GET | `/api/v1/budgets` | Get budgets for month |
| PATCH | `/api/v1/budgets/{categoryId}` | Update budget limit |
| GET | `/api/v1/goals` | List goals |
| POST | `/api/v1/goals` | Create goal |
| PATCH | `/api/v1/goals/{id}` | Update goal |
| DELETE | `/api/v1/goals/{id}` | Delete goal |
| POST | `/api/v1/goals/{id}/contribute` | Contribute to goal |
| GET | `/api/v1/forecast` | Cash-flow forecast |
| GET | `/api/v1/insights` | List insights |
| POST | `/api/v1/insights/{id}/dismiss` | Dismiss insight |
| POST | `/api/v1/insights/{id}/like` | Like insight |
| GET | `/api/v1/insights/digest/weekly` | Weekly digest |
| GET | `/api/v1/dashboard/summary` | Dashboard summary |
| POST | `/api/v1/simulator/run` | Run what-if simulation |
| POST | `/api/v1/copilot/stream` | AI Copilot (SSE streaming) |
| POST | `/api/v1/copilot/chat` | AI Copilot (non-streaming) |
| POST | `/api/v1/admin/reset` | Reset demo data |
| GET | `/api/v1/admin/export` | Export all data |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── core/                 # Config, security, logging
│   ├── db/                   # Database models and session
│   │   └── models/           # SQLAlchemy models
│   ├── api/v1/               # API endpoints
│   ├── schemas/              # Pydantic request/response models
│   └── services/             # Business logic
├── training/                 # ML training pipeline (Phase 2+)
├── data/                     # Training data (Phase 2+)
├── models/                   # Saved ML models (Phase 2+)
├── docker-compose.yml        # PostgreSQL + Redis + Backend
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Development Phases

1. ✅ **Phase 1**: FastAPI + PostgreSQL + Core CRUD + Seed Data
2. 🔲 **Phase 2**: ML Transaction Classifier
3. 🔲 **Phase 3**: Recurring Detection + Anomaly Detection
4. 🔲 **Phase 4**: Cash-Flow Forecasting
5. 🔲 **Phase 5**: Goal Engine + Simulator
6. 🔲 **Phase 6**: RAG Pipeline
7. 🔲 **Phase 7**: LLM Copilot with Function Calling
8. 🔲 **Phase 8**: MLOps + Production
