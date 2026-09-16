. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Reject-Evidence {
    param(
        [string]$TaskId,
        [string]$FileName,
        [string]$Reason
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    foreach ($ev in $task.evidence) {
        if ($ev.file -eq $FileName) {
            $ev.verified_at = $ts
            $ev.verification_status = "rejected"
            $ev.rejection_reason = $Reason
        }
    }

    $task.updated_at = $ts
    $task | ConvertTo-Json -Depth 10 | Set-Content $path

    Write-Host "Evidence $FileName rejected at $ts"
}

