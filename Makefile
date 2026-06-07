.PHONY: help build up down logs logs-backend logs-frontend logs-db ps shell shell-backend shell-db restart clean rebuild test lint format

help:
	@echo "================================"
	@echo "🐳 Kanban Board - Docker Commands"
	@echo "================================"
	@echo ""
	@echo "Core Commands:"
	@echo "  make build              Build Docker images"
	@echo "  make up                 Start all services"
	@echo "  make down               Stop all services"
	@echo "  make restart            Restart all services"
	@echo ""
	@echo "Logs & Monitoring:"
	@echo "  make logs               View all logs"
	@echo "  make logs-backend       View backend logs"
	@echo "  make logs-frontend      View frontend logs"
	@echo "  make logs-db            View database logs"
	@echo "  make ps                 Show service status"
	@echo ""
	@echo "Database:"
	@echo "  make shell-db           Connect to PostgreSQL shell"
	@echo "  make migrate            Run migrations"
	@echo ""
	@echo "Services:"
	@echo "  make shell-backend      Access backend shell"
	@echo "  make shell-frontend     Access frontend shell"
	@echo ""
	@echo "Development:"
	@echo "  make rebuild            Rebuild all images (no cache)"
	@echo "  make clean              Clean up containers and volumes"
	@echo "  make clean-all          Clean up everything (including data)"
	@echo ""

# Core Docker Commands
build:
	@echo "🔨 Building Docker images..."
	docker compose build

up:
	@echo "🚀 Starting services..."
	@if [ ! -f .env ]; then \
		echo "⚠️  .env file not found. Creating from .env.example..."; \
		cp .env.example .env; \
		echo "✅ .env created. Please update sensitive variables."; \
	fi
	docker compose up --build

down:
	@echo "🛑 Stopping services..."
	docker compose down

restart: down up
	@echo "✅ Services restarted!"

# Logs
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f postgres

# Monitoring
ps:
	@echo "📊 Container Status:"
	docker compose ps
	@echo ""
	@echo "📈 Resource Usage:"
	docker stats --no-stream

# Database
shell-db:
	docker compose exec postgres psql -U postgres -d kanban_db

shell-db-root:
	docker compose exec postgres psql -U postgres

# Shell Access
shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

# Development
rebuild:
	@echo "🔄 Rebuilding images (no cache)..."
	docker compose build --no-cache

clean:
	@echo "🧹 Cleaning up containers..."
	docker compose down

clean-all:
	@echo "🗑️  Removing all containers, volumes, and images..."
	docker compose down -v
	@echo "✅ Cleanup complete! All data removed."

# Testing & Code Quality (if applicable)
test:
	@echo "🧪 Running tests..."
	docker compose exec backend go test ./...

lint-backend:
	@echo "🔍 Linting backend..."
	docker compose exec backend golangci-lint run

# Utilities
env-setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ .env created from .env.example"; \
	else \
		echo "ℹ️  .env already exists"; \
	fi

check-env:
	@echo "🔍 Checking environment variables..."
	@if [ ! -f .env ]; then \
		echo "❌ .env file not found"; \
		exit 1; \
	fi
	@echo "✅ .env file exists"
	@grep -q "^DB_PASS=" .env && echo "✅ DB_PASS set" || echo "❌ DB_PASS missing"
	@grep -q "^JWT_SECRET=" .env && echo "✅ JWT_SECRET set" || echo "❌ JWT_SECRET missing"

# Status Check
status:
	@echo "================================"
	@echo "📊 System Status"
	@echo "================================"
	@echo ""
	@docker compose ps || echo "❌ Docker Compose not available"
	@echo ""
	@echo "🧠 Container Resource Usage:"
	@docker stats --no-stream 2>/dev/null || echo "⚠️  Services not running"

# Help for individual services
help-backend:
	@echo "Backend Commands:"
	@echo "  make shell-backend      Access backend shell"
	@echo "  make logs-backend       View backend logs"
	@echo "  make rebuild            Rebuild backend image"

help-frontend:
	@echo "Frontend Commands:"
	@echo "  make shell-frontend     Access frontend shell"
	@echo "  make logs-frontend      View frontend logs"

help-db:
	@echo "Database Commands:"
	@echo "  make shell-db           Connect to PostgreSQL"
	@echo "  make shell-db-root      Connect as root user"
	@echo "  make logs-db            View database logs"

.DEFAULT_GOAL := help
