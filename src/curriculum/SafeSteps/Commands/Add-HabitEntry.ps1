. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Add-HabitEntry {
    param(
        [string]$HabitId,
        [string]$Value
    )

    $path = Join-Path $PSScriptRoot "..\..\content\habits\$HabitId.json"
    if (-not (Test-Path $path)) { Write-Warning "Habit not found"; return }

    $habit = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $habit.entries += @{
        timestamp = $ts
        value     = $Value
    }

    $habit.updated_at = $ts

    $habit | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Habit entry added to $HabitId"
}

