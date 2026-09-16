. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-AODWeek {
    param(
        [int]$WeekNumber,
        [string]$Title
    )

    $path = Join-Path $PSScriptRoot "..\..\programs\aod_program.json"
    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $week = @{
        week_number  = $WeekNumber
        title        = $Title
        created_at   = $ts
        updated_at   = $ts
        started_at   = $null
        completed_at = $null
        lessons      = @()
    }

    $program.weeks += $week
    $program.updated_at = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Added week $WeekNumber"
}

