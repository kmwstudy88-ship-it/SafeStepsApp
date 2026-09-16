. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-RiskTrendEngine {
    $root = Join-Path $PSScriptRoot "..\..\content\analytics"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "risk_trend_engine"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        risk_history = @()
        strength_history = @()
        alerts = @()
    }

    $path = Join-Path $root "risk_trend_engine.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Risk Trend Engine initialized"
}

