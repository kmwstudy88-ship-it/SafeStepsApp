. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-SafetyPlan {
    param(
        [string]$Id,
        [string]$Title
    )

    $path = Join-Path $PSScriptRoot "..\..\content\safety_plans\$Id.json"
    $ts = Get-Timestamp

    $plan = @{
        id         = $Id
        title      = $Title
        created_at = $ts
        updated_at = $ts
        steps      = @()
        contacts   = @()
    }

    $plan | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Safety plan created: $Id"
}

