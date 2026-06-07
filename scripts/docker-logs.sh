#!/usr/bin/env bash

# Always run from the repository root, regardless of where this script is invoked.
cd "$(dirname "$0")/.." || exit 1
# 🐳 Kanban Board - Docker Logs Script (Linux/macOS)
# Usage: bash docker-logs.sh [service]

SERVICE="${1:-all}"

case "$SERVICE" in
    "all"|"frontend"|"backend"|"postgres")
        ;;
    *)
        echo "❌ Invalid service: $SERVICE"
        echo "Valid services: all, frontend, backend, postgres"
        exit 1
        ;;
esac

echo "================================"
echo "📋 Docker Logs - $SERVICE"
echo "================================"
echo ""

if [ "$SERVICE" = "all" ]; then
    docker compose logs -f
else
    docker compose logs -f "$SERVICE"
fi
