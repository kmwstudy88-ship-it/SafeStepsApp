. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Calculate-ProgressScore.ps1

function Show-ParentDashboard {

    $root = Join-Path $PSScriptRoot "..\.."

    $dashboard = @{
        lessons_completed     = 0
        assessments_completed = 0
        daily_tasks_completed = 0
        weekly_tasks_completed = 0
        evidence_submitted    = 0
        progress_score        = 0
    }

    # Lessons
    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $lesson = Get-Content $_.FullName | ConvertFrom-Json
        if ($lesson.completed_at) { $dashboard.lessons_completed++ }
    }

    # Assessments
    Get-ChildItem "$root\sections" -Filter *.json | ForEach-Object {
        $assessment = Get-Content $_.FullName | ConvertFrom-Json
        if ($assessment.completed_at) { $dashboard.assessments_completed++ }
    }

    # Daily tasks
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) { $dashboard.daily_tasks_completed++ }
        $dashboard.evidence_submitted += $task.evidence.Count
    }

    # Weekly tasks
    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) { $dashboard.weekly_tasks_completed++ }
        $dashboard.evidence_submitted += $task.evidence.Count
    }

    # Progress score
    $dashboard.progress_score = (Calculate-ProgressScore | Out-String).Trim()

    $dashboard | ConvertTo-Json -Depth 10
}

