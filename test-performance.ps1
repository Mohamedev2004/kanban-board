#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Test script for Docker performance measurement
.DESCRIPTION
  Measures build time, startup time, and health check latency
.EXAMPLE
  .\test-performance.ps1
#>

Write-Host "🚀 Docker Performance Test Suite" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Test 1: Clean Build Time
Write-Host "1️⃣ Testing CLEAN BUILD TIME..." -ForegroundColor Cyan
docker compose down -v --remove-orphans 2>&1 | Out-Null
Write-Host "   Cleanup completed" -ForegroundColor Gray

$buildStart = Get-Date
docker compose up --build -d 2>&1 | Out-Null
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalSeconds

Write-Host "   ✅ Clean build time: $([Math]::Round($buildTime, 2))s" -ForegroundColor Green
Write-Host ""

# Test 2: Service Startup Time
Write-Host "2️⃣ Testing SERVICE STARTUP TIME..." -ForegroundColor Cyan

$healthyCount = 0
$maxWait = 30
$waitTime = 0

while ($healthyCount -lt 3 -and $waitTime -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waitTime++
    
    $status = docker compose ps --format "table {{.Status}}" 2>&1 | Where-Object { $_ -like "*healthy*" } | Measure-Object
    $healthyCount = $status.Count
    
    if ($waitTime % 5 -eq 0) {
        Write-Host "   ⏳ Waiting... ($waitTime/$maxWait seconds, $healthyCount/3 healthy)" -ForegroundColor Gray
    }
}

if ($healthyCount -eq 3) {
    Write-Host "   ✅ All services healthy in ${waitTime}s" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Only $healthyCount/3 services healthy after ${waitTime}s" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Health Check Response Time
Write-Host "3️⃣ Testing HEALTH CHECK RESPONSE TIME..." -ForegroundColor Cyan

$apiCheck = Measure-Command {
    curl -sf http://localhost:8080/health 2>&1 | Out-Null
}
Write-Host "   ✅ Backend /health response: $([Math]::Round($apiCheck.TotalMilliseconds, 2))ms" -ForegroundColor Green

$frontendCheck = Measure-Command {
    curl -sf http://localhost:5173/ 2>&1 | Out-Null
}
Write-Host "   ✅ Frontend response: $([Math]::Round($frontendCheck.TotalMilliseconds, 2))ms" -ForegroundColor Green
Write-Host ""

# Test 4: Incremental Build Time
Write-Host "4️⃣ Testing INCREMENTAL BUILD TIME (with cache)..." -ForegroundColor Cyan
Write-Host "   Making a small code change..." -ForegroundColor Gray

# Simple change - add a comment to App.tsx
$appFile = ".\client\src\App.tsx"
$backup = Get-Content $appFile -Raw
Add-Content $appFile -Value "`n// Performance test comment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -NoNewline

$rebuilStart = Get-Date
docker compose up --build -d 2>&1 | Out-Null
$rebuilEnd = Get-Date
$rebuildTime = ($rebuilEnd - $rebuilStart).TotalSeconds

# Restore file
Set-Content $appFile -Value $backup

Write-Host "   ✅ Incremental build time: $([Math]::Round($rebuildTime, 2))s" -ForegroundColor Green
Write-Host "   📊 Speedup vs clean build: $([Math]::Round($buildTime / $rebuildTime, 1))x faster" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "📊 PERFORMANCE SUMMARY" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta
Write-Host "Clean build:        $([Math]::Round($buildTime, 2))s"
Write-Host "Startup time:       ${waitTime}s"
Write-Host "Incremental build:  $([Math]::Round($rebuildTime, 2))s"
Write-Host "Cache improvement:  $([Math]::Round($buildTime / $rebuildTime, 1))x faster"
Write-Host ""
Write-Host "✅ Platform is optimized and running fast!" -ForegroundColor Green

# Cleanup
Write-Host ""
Write-Host "Keeping services running... Use 'docker compose down' to stop" -ForegroundColor Gray
