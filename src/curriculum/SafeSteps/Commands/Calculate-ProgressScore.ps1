. $PSScriptRoot\Get-Timestamp.ps1
function Calculate-ProgressScore {

    $root = Join-Path $PSScriptRoot "..\.."

    $score = 0

    # Lessons completed
    Get-ChildItem "$root\content\lessons" -Filter *.json | ForEach-Object {
        $lesson = Get-Content $_.FullName | ConvertFrom-Json
        if ($lesson.completed_at) { $score += 5 }
    }

    # Assessments completed
    Get-ChildItem "$root\sections" -Filter *.json | ForEach-Object {
        $assessment = Get-Content $_.FullName | ConvertFrom-Json
        if ($assessment.completed_at) { $score += 10 }
    }

    # Daily tasks completed
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) { $score += 2 }
    }

    # Weekly tasks completed
    Get-ChildItem "$root\content\tasks\weekly" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        if ($task.completed_at) { $score += 3 }
    }

    # Evidence quality
    Get-ChildItem "$root\content\tasks\daily" -Filter *.json | ForEach-Object {
        $task = Get-Content $_.FullName | ConvertFrom-Json
        foreach ($ev in $task.evidence) {
            if ($ev.verification_status -eq "verified") {
                $score += [math]::Min($ev.clarity_score / 10, 10)
            }
        }
    }

    Write-Host "Parent Progress Score: $score"
}

