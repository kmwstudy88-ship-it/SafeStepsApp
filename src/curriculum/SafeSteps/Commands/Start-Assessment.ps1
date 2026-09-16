. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Start-Assessment {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\sections\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Assessment not found"; return }

    $assessment = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $assessment.started_at = $ts
    $assessment.updated_at = $ts

    $assessment | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Assessment $Id started at $ts"
}

