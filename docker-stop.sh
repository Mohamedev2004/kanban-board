#!/usr/bin/env bash
# 🐳 Kanban Board - Docker Cleanup Script (Linux/macOS)
# Usage: bash docker-stop.sh

echo "================================"
echo "🐳 Kanban Board - Docker Shutdown"
echo "================================"
echo ""

read -p "Do you want to remove data volumes? (y/n): " choice

if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
    echo "🛑 Stopping services and removing volumes..."
    docker compose down -v
    echo "✅ Services stopped and volumes removed."
    echo "⚠️  All data has been deleted!"
else
    echo "🛑 Stopping services..."
    docker compose down
    echo "✅ Services stopped. Volumes preserved."
fi

echo ""
echo "🧹 Cleanup complete!"
