. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Link-EvidenceChild {
    param(
        [string]$TaskId,
        [string]$FileName,
        [string]$ChildId
    )

    $taskPath = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $taskPath)) { Write-Warning "Task not found"; return }

    $task = Get-Content $taskPath | ConvertFrom-Json
    $ts = Get-Timestamp

    foreach ($ev in $task.evidence) {
        if ($ev.file -eq $FileName) {
            $ev.child_id = $ChildId
        }
    }

    $task.updated_at = $ts
    $task | ConvertTo-Json -Depth 10 | Set-Content $taskPath

    Write-Host "Linked evidence $FileName to child $ChildId"
}

