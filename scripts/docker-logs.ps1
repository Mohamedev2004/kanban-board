#!/usr/bin/env pwsh
# Always run from the repository root, regardless of where this script is invoked.
Set-Location (Split-Path -Parent $PSScriptRoot)

# 🐳 Kanban Board - Docker Logs Script (Windows PowerShell)
# Usage: .\docker-logs.ps1 [service]

param(
    [string]$Service = "all"
)

$validServices = @("all", "frontend", "backend", "postgres")

if (-not $validServices -contains $Service) {
    Write-Host "❌ Invalid service: $Service" -ForegroundColor Red
    Write-Host "Valid services: $($validServices -join ', ')" -ForegroundColor Yellow
    exit 1
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 Docker Logs - $Service" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($Service -eq "all") {
    docker compose logs -f
} else {
    docker compose logs -f $Service
}
