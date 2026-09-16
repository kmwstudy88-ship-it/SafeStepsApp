. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Sync-Item {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) { Write-Warning "File not found"; return }

    $item = Get-Content $Path | ConvertFrom-Json
    $ts = Get-Timestamp

    $item.synced_at = $ts
    $item.updated_at = $ts

    $item | ConvertTo-Json -Depth 10 | Set-Content $Path
    Write-Host "Synced: $Path at $ts"
}

