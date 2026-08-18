.PHONY: dev install docker-up docker-down seed train evaluate pipeline lint test

# Development
dev:
	uvicorn app.main:app --reload --port 8000

install:
	pip install -r requirements.txt

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

# Database
seed:
	python -c "import asyncio; from app.api.v1.admin import seed_database; from app.db.session import async_session_factory; asyncio.run(seed_database(async_session_factory()))"

# ML Training (Phase 2+)
train:
	python -m training.pipeline

train-classifier:
	python -m training.classifiers.train_classifier

train-anomaly:
	python -m training.anomaly.train_anomaly

train-forecast:
	python -m training.forecasting.train_forecast

evaluate:
	python -m training.evaluation.evaluate

pipeline:
	python -m training.pipeline

# Data
generate-data:
	python -m scripts.generate_demo_data

# Quality
lint:
	ruff check app/ training/

test:
	pytest tests/ -v --cov=app

test-api:
	pytest tests/test_api/ -v

test-ml:
	pytest tests/test_ml/ -v
