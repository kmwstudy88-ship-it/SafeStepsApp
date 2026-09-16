. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Approve-Task {
    param(
        [string]$TaskId,
        [string]$Caseworker,
        [string]$Notes
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $task.caseworker_approval = @{
        caseworker = $Caseworker
        notes      = $Notes
        approved_at = $ts
        status     = "approved"
    }

    $task.updated_at = $ts

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Task $TaskId approved by $Caseworker"
}

