. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Goal {
    param(
        [string]$Id,
        [string]$Description
    )

    $path = Join-Path $PSScriptRoot "..\..\content\goals\$Id.json"
    $ts = Get-Timestamp

    $goal = @{
        id           = $Id
        description  = $Description
        created_at   = $ts
        updated_at   = $ts
        completed_at = $null
        progress     = @()
    }

    $goal | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Goal created: $Id"
}

