#!/usr/bin/env pwsh
# Always run from the repository root, regardless of where this script is invoked.
Set-Location (Split-Path -Parent $PSScriptRoot)

# 🐳 Kanban Board - Docker Startup Script (Windows PowerShell)
# Usage: .\docker-start.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🐳 Kanban Board - Docker Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created. Please update it with your configuration." -ForegroundColor Green
    Write-Host ""
}

# Check if Docker is running
Write-Host "🔍 Checking Docker daemon..." -ForegroundColor Cyan
try {
    $dockerStatus = docker version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start services
docker compose up --build

Write-Host ""
Write-Host "✅ Services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8080" -ForegroundColor White
Write-Host "   Database:  localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Type 'docker compose down' to stop all services" -ForegroundColor Yellow
