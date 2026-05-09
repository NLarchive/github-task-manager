#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Quick-start script for testing LLM inference pipeline
    
.DESCRIPTION
    - Validates bridge server is running
    - Validates llama.cpp is running
    - Runs inference quality tests
    - Provides debugging options
    
.EXAMPLE
    .\test-inference.ps1
    .\test-inference.ps1 -Debug
    .\test-inference.ps1 -StartServers
#>

param(
    [switch]$Debug,
    [switch]$StartServers,
    [string]$Prompt = "What is 2+2?"
)

$BridgePort = 3131
$LlamaPort = 8080
$AgenticRoot = Split-Path $PSScriptRoot -Parent
$PublicRoot = Split-Path $AgenticRoot -Parent
$ProjectRoot = Split-Path $PublicRoot -Parent
$BridgeServerPath = Join-Path $AgenticRoot 'server\main.js'
$LlamaServerBinary = 'D:\AI\runtime\llama-b8920-win-cuda12.4\llama-server.exe'
$GemmaSchemaPath = Join-Path $AgenticRoot 'components\models\gemma\gemma4-26b-a4b-q4kxl\schema.json'
$GemmaModelPath = '..\..\public\agentic-ide\components\models\gemma\gemma4-26b-a4b-q4kxl\gemma-4-26B-A4B-it-UD-Q4_K_XL.gguf'

if (Test-Path -LiteralPath $GemmaSchemaPath) {
    try {
        $gemmaSchema = Get-Content -LiteralPath $GemmaSchemaPath -Raw | ConvertFrom-Json
        if ($gemmaSchema.model_asset_path) {
            $GemmaModelPath = [string]$gemmaSchema.model_asset_path
        }
    } catch {
        # Fall back to the relative in-repo model path documented above.
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Agentic IDE Inference Testing & Debugging                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Helper: Check if an HTTP endpoint responds with success
function Test-HttpEndpoint {
    param(
        [string]$Uri,
        [string]$Method = 'GET',
        [string]$Body = $null,
        [int]$TimeoutSec = 5
    )
    try {
        if ($Method -eq 'POST') {
            $response = Invoke-WebRequest -Uri $Uri -Method Post -ContentType 'application/json' -Body $Body -TimeoutSec $TimeoutSec -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Uri -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        }
        return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300)
    } catch {
        return $false
    }
}

# Helper: Start a process in new window
function Start-ServerWindow {
    param([string]$Title, [string]$Command, [string]$WorkingDirectory)
    Write-Host "🚀 Starting: $Title" -ForegroundColor Green
    Start-Process -FilePath "pwsh" -ArgumentList "-NoExit", "-Command", "Set-Location '$WorkingDirectory'; $Command"
    Start-Sleep -Milliseconds 1500
}

# Step 1: Check servers
Write-Host "📋 Checking server status...`n" -ForegroundColor Yellow

$bridgeOk = Test-HttpEndpoint -Uri "http://localhost:$BridgePort/api/model"
$llamaOk = Test-HttpEndpoint -Uri "http://localhost:$LlamaPort/completion" -Method 'POST' -Body '{"prompt":"ping","max_tokens":1,"temperature":0}'

Write-Host "   Bridge Server (port $BridgePort):  $(if ($bridgeOk) { '✅ Running' } else { '❌ Not running' })"
Write-Host "   LLaMA.cpp (port $LlamaPort):     $(if ($llamaOk) { '✅ Running' } else { '❌ Not running' })`n"

# Step 2: Start servers if needed
if ($StartServers -and (-not $bridgeOk -or -not $llamaOk)) {
    Write-Host "🔧 Starting servers...`n" -ForegroundColor Green
    
    if (-not $bridgeOk) {
        Start-ServerWindow "Bridge Server" `
            "node '$BridgeServerPath'" `
            $AgenticRoot
    }
    
    if (-not $llamaOk) {
        if (Test-Path -LiteralPath $LlamaServerBinary) {
            Start-ServerWindow "LLaMA Server" `
                "& '$LlamaServerBinary' -m '$GemmaModelPath' --port 8080" `
                $ProjectRoot
        }
    }
    
    Write-Host "⏳ Waiting for servers to start (10s)...`n"
    Start-Sleep -Seconds 10
    
    # Recheck
    $bridgeOk = Test-HttpEndpoint -Uri "http://localhost:$BridgePort/api/model"
    $llamaOk = Test-HttpEndpoint -Uri "http://localhost:$LlamaPort/completion" -Method 'POST' -Body '{"prompt":"ping","max_tokens":1,"temperature":0}'
}

# Step 3: Verify connectivity
if (-not $bridgeOk -or -not $llamaOk) {
    Write-Host "❌ ERROR: One or more servers not running`n" -ForegroundColor Red
    Write-Host "To start servers manually:"
    Write-Host "  Terminal 1: node public/agentic-ide/server/main.js"
    Write-Host "  Terminal 2: cd outputs/local-runs/llama-*"
    Write-Host "             .\llama-server.exe -m '<model>' --port 8080`n"
    Write-Host "Or run with -StartServers flag: .\public\agentic-ide\tests\test-inference.ps1 -StartServers`n"
    exit 1
}

Write-Host "✅ All servers ready!`n" -ForegroundColor Green

# Step 4: Run tests
if ($Debug) {
    Write-Host "🔍 Running inference debugger...`n" -ForegroundColor Cyan
    Write-Host "📋 Prompt: `"$Prompt`"`n"
    
    & node "$PSScriptRoot\inference-debug.js" $Prompt
} else {
    Write-Host "🧪 Running quality test suite...`n" -ForegroundColor Cyan
    
    & node "$PSScriptRoot\inference-quality-test.js"
}

Write-Host "`n✨ Done!`n"
