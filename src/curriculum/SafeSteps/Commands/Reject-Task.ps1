. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Reject-Task {
    param(
        [string]$TaskId,
        [string]$Caseworker,
        [string]$Reason
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    $task.caseworker_approval = @{
        caseworker = $Caseworker
        reason     = $Reason
        rejected_at = $ts
        status     = "rejected"
    }

    $task.updated_at = $ts

    $task | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Task $TaskId rejected by $Caseworker"
}

