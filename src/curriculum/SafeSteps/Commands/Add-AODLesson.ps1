. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-AODLesson {
    param(
        [int]$WeekNumber,
        [string]$LessonId
    )

    $path = Join-Path $PSScriptRoot "..\..\programs\aod_program.json"
    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $week = $program.weeks | Where-Object { $_.week_number -eq $WeekNumber }

    if (-not $week) {
        Write-Warning "Week not found: $WeekNumber"
        return
    }

    $week.lessons += @{
        lesson_id    = $LessonId
        added_at     = $ts
        started_at   = $null
        completed_at = $null
    }

    $program.updated_at = $ts

    $program | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Added lesson $LessonId to week $WeekNumber"
}

