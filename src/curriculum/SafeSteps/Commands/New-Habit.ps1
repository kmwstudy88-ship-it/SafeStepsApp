. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Habit {
    param(
        [string]$Id,
        [string]$Description
    )

    $path = Join-Path $PSScriptRoot "..\..\content\habits\$Id.json"
    $ts = Get-Timestamp

    $habit = @{
        id           = $Id
        description  = $Description
        created_at   = $ts
        updated_at   = $ts
        entries      = @()
    }

    $habit | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Habit created: $Id"
}

