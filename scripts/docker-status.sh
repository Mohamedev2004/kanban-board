#!/usr/bin/env bash

# Always run from the repository root, regardless of where this script is invoked.
cd "$(dirname "$0")/.." || exit 1
# 🐳 Kanban Board - Docker Status Script (Linux/macOS)
# Usage: bash docker-status.sh

echo "================================"
echo "📊 Docker Services Status"
echo "================================"
echo ""

docker compose ps

echo ""
echo "📈 Resource Usage:"
docker stats --no-stream

echo ""
echo "🔗 Network Inspection:"
docker network inspect kanban_network

echo ""
echo "💾 Volumes:"
docker volume ls --filter name=kanban

echo ""
echo "✅ Status check complete!"
