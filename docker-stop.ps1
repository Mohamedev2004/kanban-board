#!/usr/bin/env pwsh
# 🐳 Kanban Board - Docker Cleanup Script (Windows PowerShell)
# Usage: .\docker-stop.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🐳 Kanban Board - Docker Shutdown" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Do you want to remove data volumes? (y/n)"

if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "🛑 Stopping services and removing volumes..." -ForegroundColor Yellow
    docker compose down -v
    Write-Host "✅ Services stopped and volumes removed." -ForegroundColor Green
    Write-Host "⚠️  All data has been deleted!" -ForegroundColor Yellow
} else {
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    docker compose down
    Write-Host "✅ Services stopped. Volumes preserved." -ForegroundColor Green
}

Write-Host ""
Write-Host "🧹 Cleanup complete!" -ForegroundColor Green
