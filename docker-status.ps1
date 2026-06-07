#!/usr/bin/env pwsh
# 🐳 Kanban Board - Docker Status Script (Windows PowerShell)
# Usage: .\docker-status.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Docker Services Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

docker compose ps

Write-Host ""
Write-Host "📈 Resource Usage:" -ForegroundColor Cyan
docker stats --no-stream

Write-Host ""
Write-Host "🔗 Network Inspection:" -ForegroundColor Cyan
docker network inspect kanban_network --format='{{json .}}' | ConvertFrom-Json | Select-Object -ExpandProperty Containers | Format-Table Name, IPv4Address

Write-Host ""
Write-Host "💾 Volumes:" -ForegroundColor Cyan
docker volume ls --filter name=kanban

Write-Host ""
Write-Host "✅ Status check complete!" -ForegroundColor Green
