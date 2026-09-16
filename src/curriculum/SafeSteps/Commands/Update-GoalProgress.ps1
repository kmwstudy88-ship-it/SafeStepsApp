. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Update-GoalProgress {
    param(
        [string]$GoalId,
        [string]$Entry
    )

    $path = Join-Path $PSScriptRoot "..\..\content\goals\$GoalId.json"
    if (-not (Test-Path $path)) { Write-Warning "Goal not found"; return }

    $goal = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $goal.progress += @{
        timestamp = $ts
        entry     = $Entry
    }

    $goal.updated_at = $ts

    $goal | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Progress added to goal $GoalId"
}

