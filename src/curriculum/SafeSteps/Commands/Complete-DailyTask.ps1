. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Complete-DailyTask {
    param([string]$Id)

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$Id.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $task.completed_at = $ts
    $task.updated_at   = $ts

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Daily task $Id completed at $ts"
}

