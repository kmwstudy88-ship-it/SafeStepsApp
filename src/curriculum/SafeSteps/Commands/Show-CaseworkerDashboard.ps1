. $PSScriptRoot\Get-Timestamp.ps1
function Show-CaseworkerDashboard {

    $root = Join-Path $PSScriptRoot "..\.."

    $dashboard = @{
        programs = @()
        evidence_summary = @()
        risk_flags = @()
    }

    # Programs
    Get-ChildItem "$root\programs" -Filter *.json | ForEach-Object {
        $program = Get-Content $_.FullName | ConvertFrom-Json

        $dashboard.programs += @{
            id            = $program.id
            title         = $program.title
            started_at    = $program.started_at
            completed_at  = $program.completed_at
            milestones    = $program.milestones
            caseworker_review = $program.caseworker_review
        }
    }

    # Evidence summary
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json

        foreach ($ev in $task.evidence) {
            $dashboard.evidence_summary += @{
                task_id     = $task.id
                file        = $ev.file
                clarity     = $ev.clarity_score
                status      = $ev.verification_status
                verified_at = $ev.verified_at
            }
        }
    }

    # Risk flags
    foreach ($ev in $dashboard.evidence_summary) {
        if ($ev.clarity -lt 20) {
            $dashboard.risk_flags += "Low clarity evidence: $($ev.file)"
        }
        if ($ev.status -eq "rejected") {
            $dashboard.risk_flags += "Rejected evidence: $($ev.file)"
        }
    }

    $dashboard | ConvertTo-Json -Depth 20
}

