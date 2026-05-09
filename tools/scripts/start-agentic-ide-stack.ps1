param(
  [string]$RepoRoot = "D:\web\web-github-task-manager",
  [string]$ModelPath = "",
  [string]$LlamaServerBinary = "D:\AI\runtime\llama-b8920-win-cuda12.4\llama-server.exe",
  [int]$AppPort = 3000,
  [int]$BridgePort = 3131,
  [int]$LlmPort = 8080,
  [int]$LlmReadyTimeoutSec = 240,
  [switch]$ForceRestart,
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-TcpPortOpen {
  param(
    [string]$HostName,
    [int]$Port
  )
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $iar = $client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne(500)) {
      $client.Close()
      return $false
    }
    $client.EndConnect($iar)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

function Wait-HttpOk {
  param(
    [string]$Url,
    [int]$TimeoutMs = 20000
  )
  $start = Get-Date
  while (((Get-Date) - $start).TotalMilliseconds -lt $TimeoutMs) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -UseBasicParsing
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
        return $true
      }
    } catch {
      # keep waiting
    }
    Start-Sleep -Milliseconds 400
  }
  return $false
}

function Resolve-LlamaBinary {
  param(
    [string]$Candidate,
    [string]$WorkingDir
  )

  if ([string]::IsNullOrWhiteSpace($Candidate)) {
    throw 'Llama server binary path is empty.'
  }

  $expanded = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Candidate)
  if (Test-Path -LiteralPath $expanded) {
    return $expanded
  }

  if (-not [System.IO.Path]::HasExtension($Candidate)) {
    $exeCandidate = "$Candidate.exe"
    $expandedExe = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($exeCandidate)
    if (Test-Path -LiteralPath $expandedExe) {
      return $expandedExe
    }
  }

  $inPath = Get-Command $Candidate -ErrorAction SilentlyContinue
  if ($inPath) {
    return $inPath.Source
  }

  if (-not [System.IO.Path]::HasExtension($Candidate)) {
    $inPathExe = Get-Command "$Candidate.exe" -ErrorAction SilentlyContinue
    if ($inPathExe) {
      return $inPathExe.Source
    }
  }

  $bundledRuntimeRoot = Join-Path $WorkingDir 'public\agentic-ide\components\runtime'
  if (Test-Path -LiteralPath $bundledRuntimeRoot) {
    $bundledBinary = Get-ChildItem -Path $bundledRuntimeRoot -Filter 'llama-server.exe' -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($bundledBinary) {
      return $bundledBinary.FullName
    }
  }

  throw "Could not find llama binary: $Candidate. Pass -LlamaServerBinary with full path to llama-server(.exe)."
}

function Resolve-AgenticModelPath {
  param(
    [string]$RepoRoot
  )

  $schemaPath = Join-Path $RepoRoot 'public\agentic-ide\components\models\gemma\gemma4-26b-a4b-q4kxl\schema.json'
  if (-not (Test-Path -LiteralPath $schemaPath)) {
    throw "Gemma model schema not found: $schemaPath"
  }

  $schema = Get-Content -LiteralPath $schemaPath -Raw | ConvertFrom-Json
  $candidate = ''
  if ($schema.model_asset_path) {
    $candidate = [string]$schema.model_asset_path
  } elseif ($schema.model_name) {
    $candidate = Join-Path (Split-Path -Parent $schemaPath) ([string]$schema.model_name)
  }

  if ([string]::IsNullOrWhiteSpace($candidate)) {
    throw "No model_asset_path or model_name found in $schemaPath"
  }

  if ([System.IO.Path]::IsPathRooted($candidate)) {
    return [System.IO.Path]::GetFullPath($candidate)
  }

  return [System.IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $schemaPath) $candidate))
}

function Start-NodeService {
  param(
    [string]$Name,
    [string]$Command,
    [string]$WorkingDir,
    [int]$Port
  )

  $alreadyUp = Test-TcpPortOpen -HostName '127.0.0.1' -Port $Port
  if ($alreadyUp -and -not $ForceRestart) {
    Write-Host "[$Name] already running on port $Port"
    return
  }

  if ($alreadyUp -and $ForceRestart) {
    Write-Host "[$Name] port $Port is busy and -ForceRestart was requested."
    Write-Host "[$Name] Attempting to stop listeners on port $Port..."
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
      try {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
      } catch {
        Write-Warning "Could not stop PID $($conn.OwningProcess) for port $Port"
      }
    }
  }

  Write-Host "[$Name] starting: $Command"
  if ($DryRun) {
    return
  }

  Start-Process -FilePath 'pwsh' -WorkingDirectory $WorkingDir -ArgumentList @(
    '-NoExit',
    '-Command',
    $Command
  ) | Out-Null
}

function Wait-LlmReadyThroughBridge {
  param(
    [int]$BridgePort,
    [int]$TimeoutSec = 240
  )

  $start = Get-Date
  while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
    try {
      $body = @{ prompt = 'health check'; max_tokens = 1 } | ConvertTo-Json
      $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$BridgePort/api/llm/complete" -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 8 -UseBasicParsing
      if ($resp.StatusCode -eq 200) {
        return $true
      }
    } catch {
      $detail = $_.ErrorDetails.Message
      if ($detail -and $detail -match 'Loading model|unavailable_error|503') {
        Write-Host '[llm] model is loading, waiting...'
      }
    }
    Start-Sleep -Milliseconds 1000
  }
  return $false
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  throw "RepoRoot not found: $RepoRoot"
}

if ([string]::IsNullOrWhiteSpace($ModelPath)) {
  $ModelPath = Resolve-AgenticModelPath -RepoRoot $RepoRoot
}

if (-not (Test-Path -LiteralPath $ModelPath)) {
  throw "Model file not found: $ModelPath"
}

Write-Host "RepoRoot : $RepoRoot"
Write-Host "Model    : $ModelPath"
Write-Host "Ports    : app=$AppPort bridge=$BridgePort llama=$LlmPort"

$resolvedLlamaBinary = Resolve-LlamaBinary -Candidate $LlamaServerBinary -WorkingDir $RepoRoot
Write-Host "LLaMA bin: $resolvedLlamaBinary"

$serverCommand = "node server.js"
$bridgeCommand = "node public/agentic-ide/server/main.js"
$llamaCommand = "`"$resolvedLlamaBinary`" -m `"$ModelPath`" --port $LlmPort --ctx-size 4096"

Start-NodeService -Name 'server.js' -Command $serverCommand -WorkingDir $RepoRoot -Port $AppPort
Start-NodeService -Name 'bridge-server.js' -Command $bridgeCommand -WorkingDir $RepoRoot -Port $BridgePort
Start-NodeService -Name 'llama-server' -Command $llamaCommand -WorkingDir $RepoRoot -Port $LlmPort

if ($DryRun) {
  Write-Host 'DryRun completed. No process was started.'
  exit 0
}

$serverOk = Wait-HttpOk -Url "http://127.0.0.1:$AppPort/health"
$bridgeRegistryOk = Wait-HttpOk -Url "http://127.0.0.1:$BridgePort/api/registry"
$bridgeModelOk = Wait-HttpOk -Url "http://127.0.0.1:$BridgePort/api/model"
$llamaTcp = Test-TcpPortOpen -HostName '127.0.0.1' -Port $LlmPort

$llmOk = Wait-LlmReadyThroughBridge -BridgePort $BridgePort -TimeoutSec $LlmReadyTimeoutSec

Write-Host ""
Write-Host "Startup status:"
Write-Host "- App /health             : $serverOk"
Write-Host "- Bridge /api/registry    : $bridgeRegistryOk"
Write-Host "- Bridge /api/model       : $bridgeModelOk"
Write-Host "- LLaMA port open         : $llamaTcp"
Write-Host "- Bridge /api/llm/complete: $llmOk"
Write-Host ""
Write-Host "Open: http://127.0.0.1:$AppPort/agentic-ide/index.html"

if (-not $llamaTcp -or -not $llmOk) {
  Write-Warning 'LLM is not healthy yet. Verify llama-server started successfully in its terminal and supports /completion.'
  Write-Warning "You can pass -LlamaServerBinary with full path, e.g. -LlamaServerBinary 'C:\\llama\\llama-server.exe'"
}
