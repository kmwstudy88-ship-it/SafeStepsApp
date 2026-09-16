. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-DailyTask {
    param(
        [string]$Id,
        [string]$Description
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$Id.json"
    $ts = Get-Timestamp

    $task = @{
        id           = $Id
        description  = $Description
        created_at   = $ts
        updated_at   = $ts
        started_at   = $null
        completed_at = $null
        evidence     = @()
    }

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Daily task created: $Id"
}

