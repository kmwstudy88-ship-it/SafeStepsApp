. $PSScriptRoot\Get-Timestamp.ps1
function Calculate-RiskScore {

    $root = Join-Path $PSScriptRoot "..\.."
    $risk = 0

    # Missed daily tasks
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if (-not $task.completed_at) { $risk += 5 }
    }

    # Missed weekly tasks
    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if (-not $task.completed_at) { $risk += 10 }
    }

    # Evidence issues
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        foreach ($ev in $task.evidence) {
            if ($ev.verification_status -eq "rejected") { $risk += 20 }
            if ($ev.clarity_score -lt 20) { $risk += 10 }
        }
    }

    # Incomplete lessons
    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $lesson = Get-Content $_.FullName | ConvertFrom-Json
        if (-not $lesson.completed_at) { $risk += 2 }
    }

    Write-Host "Risk Score: $risk"
}

