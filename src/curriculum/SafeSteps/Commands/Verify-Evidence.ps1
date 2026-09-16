. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Verify-Evidence {
    param(
        [string]$TaskId,
        [string]$FileName,
        [int]$ClarityScore = 100
    )

    $path = Join-Path $PSScriptRoot "..\..\content\tasks\daily\$TaskId.json"
    if (-not (Test-Path $path)) { Write-Warning "Task not found"; return }

    $task = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    foreach ($ev in $task.evidence) {
        if ($ev.file -eq $FileName) {
            $ev.verified_at = $ts
            $ev.clarity_score = $ClarityScore
            $ev.verification_status = "verified"
        }
    }

    $task.updated_at = $ts
    $task | ConvertTo-Json -Depth 10 | Set-Content $path

    Write-Host "Evidence $FileName verified at $ts"
}

