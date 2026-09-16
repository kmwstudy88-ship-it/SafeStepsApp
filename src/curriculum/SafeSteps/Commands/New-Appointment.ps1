. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function New-Appointment {
    param(
        [string]$Id,
        [string]$Type,
        [string]$Date,
        [string]$With
    )

    $path = Join-Path $PSScriptRoot "..\..\content\appointments\$Id.json"
    $ts = Get-Timestamp

    $appt = @{
        id         = $Id
        type       = $Type
        date       = $Date
        with       = $With
        created_at = $ts
        updated_at = $ts
        attended_at = $null
        notes      = @()
    }

    $appt | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Appointment created: $Id"
}

