. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Calculate-RiskScore.ps1

function Generate-Alerts {

    $root = Join-Path $PSScriptRoot "..\.."
    $alerts = @()

    # Evidence alerts
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        foreach ($ev in $task.evidence) {
            if ($ev.verification_status -eq "rejected") {
                $alerts += "Rejected evidence: $($ev.file)"
            }
            if ($ev.clarity_score -lt 20) {
                $alerts += "Low clarity evidence: $($ev.file)"
            }
        }
    }

    # Missed tasks
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if (-not $task.completed_at) {
            $alerts += "Missed daily task: $($task.id)"
        }
    }

    # Risk score
    $risk = (Calculate-RiskScore | Out-String).Trim()
    if ($risk -gt 50) { $alerts += "High risk score: $risk" }
    if ($risk -gt 80) { $alerts += "Critical risk score: $risk" }

    $alerts | ConvertTo-Json -Depth 10
}

