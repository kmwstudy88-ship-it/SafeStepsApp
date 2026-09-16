. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-WeeklyTask {
    param(
        [string]$Id,
        [string]$Description
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\weekly\$Id.json"
    $ts = Get-Timestamp

    $task = @{
        id           = $Id
        description  = $Description
        created_at   = $ts
        updated_at   = $ts
        completed_at = $null
        synced_at    = $null
        evidence     = @()
    }

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Weekly task created: $Id"
}

