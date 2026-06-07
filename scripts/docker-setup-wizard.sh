#!/bin/bash

# Always run from the repository root, regardless of where this script is invoked.
cd "$(dirname "$0")/.." || exit 1
# 🐳 Docker Setup Wizard - Kanban Board
# Automatic setup script for Docker environment

set -e

echo "================================"
echo "🐳 Kanban Board - Docker Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please update the following variables in .env:${NC}"
    echo "   - DB_PASS (database password)"
    echo "   - JWT_SECRET (use: openssl rand -hex 32)"
    echo "   - MAIL_PASSWORD (SendGrid API key)"
    echo ""
    read -p "Press Enter when you've updated .env..."
fi

# Check Docker
echo ""
echo "🔍 Checking Docker installation..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo -e "${GREEN}✅ Docker Compose is installed${NC}"

# Check if Docker daemon is running
echo ""
echo "🔍 Checking Docker daemon..."

if ! docker version &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    echo "Please start Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker daemon is running${NC}"

# Summary
echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""
echo "🚀 To start the application, run:"
echo ""
echo -e "${GREEN}docker compose up --build${NC}"
echo ""
echo "Or use the helper commands:"
echo ""
echo "  🐧 Linux/macOS:"
echo "    make help"
echo "    make up"
echo ""
echo "  🪟 Windows PowerShell:"
echo "    .\docker-start.ps1"
echo ""
echo "📍 Access your services at:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8080"
echo "   Database:  localhost:5432"
echo ""
