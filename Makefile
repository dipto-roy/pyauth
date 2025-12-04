.PHONY: run test migrate revision

# Start development server
run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test:
	pytest -v

# Run database migrations
migrate:
	alembic upgrade head

# Create new migration revision
revision:
	alembic revision --autogenerate -m "$(msg)"

# Start postgres container
db-up:
	docker-compose up -d

# Stop postgres container
db-down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f
