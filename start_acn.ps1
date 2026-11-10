Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  AGENTIC CLEARING NETWORK (ACN) — PAYPAL SANDBOX ESCROW ENGINE" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

$BackendPath = Join-Path $PSScriptRoot "backend"
$FrontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "[1/2] Starting FastAPI Agentic Clearing Orchestrator on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendPath'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting Next.js + AG Grid Operator HUD on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendPath'; npm run dev"

Write-Host "Both servers launching! Open http://localhost:3000 in your browser." -ForegroundColor Yellow
