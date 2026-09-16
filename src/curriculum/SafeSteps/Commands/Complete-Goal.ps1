. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Complete-Goal {
    param([string]$GoalId)

    $path = Join-Path $PSScriptRoot "..\..\content\goals\$GoalId.json"
    if (-not (Test-Path $path)) { Write-Warning "Goal not found"; return }

    $goal = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $goal.completed_at = $ts
    $goal.updated_at   = $ts

    $goal | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Goal $GoalId completed at $ts"
}

