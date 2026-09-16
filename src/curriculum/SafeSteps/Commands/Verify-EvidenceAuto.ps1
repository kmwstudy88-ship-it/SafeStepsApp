. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Check-EvidenceClarity.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Verify-EvidenceAuto {
    param(
        [string]$TaskId,
        [string]$FileName
    )

    $taskPath = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $taskPath)) { Write-Warning "Task not found"; return }

    $filePath = Join-Path $PSScriptRoot "..\..\evidence\$FileName"
    if (-not (Test-Path $filePath)) { Write-Warning "Evidence file not found"; return }

    $task = Get-Content $taskPath | ConvertFrom-Json
    $ts = Get-Timestamp

    $check = Check-EvidenceClarity -FilePath $filePath

    foreach ($ev in $task.evidence) {
        if ($ev.file -eq $FileName) {
            $ev.verified_at = $ts
            $ev.clarity_score = $check.clarity_score
            $ev.captured_at = $check.captured_at
            $ev.verification_status = "verified"
        }
    }

    $task.updated_at = $ts
    $task | ConvertTo-Json -Depth 10 | Set-Content $taskPath

    Write-Host "Evidence $FileName auto-verified with clarity score $($check.clarity_score)"
}

