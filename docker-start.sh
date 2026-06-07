#!/usr/bin/env bash
# 🐳 Kanban Board - Docker Startup Script (Linux/macOS)
# Usage: bash docker-start.sh

echo "================================"
echo "🐳 Kanban Board - Docker Startup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update it with your configuration."
    echo ""
fi

# Check if Docker is running
echo "🔍 Checking Docker daemon..."
if ! docker version &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi

echo "✅ Docker is running"
echo ""
echo "🚀 Starting services..."
echo ""

# Start services
docker compose up --build

echo ""
echo "✅ Services started!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8080"
echo "   Database:  localhost:5432"
echo ""
echo "Type 'docker compose down' to stop all services"
