. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-AuditEntry {
    param(
        [string]$Action,
        [string]$Caseworker,
        [string]$Details
    )

    $path = Join-Path $PSScriptRoot "..\..\content\audit_logs\audit.json"
    $ts = Get-Timestamp

    if (-not (Test-Path $path)) {
        $log = @{ entries = @() }
    } else {
        $log = Get-Content $path | ConvertFrom-Json
    }

    $log.entries += @{
        action     = $Action
        caseworker = $Caseworker
        details    = $Details
        timestamp  = $ts
    }

    $log | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Audit entry added"
}

