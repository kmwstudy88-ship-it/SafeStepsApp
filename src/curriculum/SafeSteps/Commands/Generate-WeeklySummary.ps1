. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Calculate-ProgressScore.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Generate-WeeklySummary {

    $root = Join-Path $PSScriptRoot "..\.."
    $ts = Get-Timestamp

    $summary = @{
        generated_at = $ts
        lessons_completed = @()
        assessments_completed = @()
        daily_tasks_completed = @()
        weekly_tasks_completed = @()
        evidence_submitted = @()
        progress_score = 0
    }

    # Lessons
    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $lesson = Get-Content $_.FullName | ConvertFrom-Json
        if ($lesson.completed_at) {
            $summary.lessons_completed += $lesson.id
        }
    }

    # Assessments
    Get-ChildItem "$root\sections" -Filter *.json | ForEach-Object {
        $assessment = Get-Content $_.FullName | ConvertFrom-Json
        if ($assessment.completed_at) {
            $summary.assessments_completed += $assessment.id
        }
    }

    # Daily tasks
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) {
            $summary.daily_tasks_completed += $task.id
        }
        foreach ($ev in $task.evidence) {
            $summary.evidence_submitted += $ev.file
        }
    }

    # Weekly tasks
    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) {
            $summary.weekly_tasks_completed += $task.id
        }
        foreach ($ev in $task.evidence) {
            $summary.evidence_submitted += $ev.file
        }
    }

    # Progress score
    $summary.progress_score = (Calculate-ProgressScore | Out-String).Trim()

    $summary | ConvertTo-Json -Depth 20
}

