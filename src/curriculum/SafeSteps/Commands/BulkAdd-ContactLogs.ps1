. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-ContactLogs {
    $root = Join-Path $PSScriptRoot "..\..\content\contact_logs"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $log = @{
        id = "contact_log_01"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        sessions = @()
    }

    $path = Join-Path $root "contact_log_01.json"
    $log | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Contact Log Pack initialized"
}

