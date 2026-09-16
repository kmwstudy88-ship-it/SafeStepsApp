. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Auto-Progress {
    param([string]$ProgramId)

    $path = Join-Path $PSScriptRoot "..\..\programs\$ProgramId.json"
    if (-not (Test-Path $path)) { Write-Warning "Program not found"; return }

    $program = Get-Content $path | ConvertFrom-Json
    $ts = Get-Timestamp

    foreach ($week in $program.weeks) {
        $allLessonsCompleted = $true

        foreach ($lesson in $week.lessons) {
            $lessonPath = Join-Path $PSScriptRoot "..\..\content\lessons\$($lesson.lesson_id).json"
            if (Test-Path $lessonPath) {
                $lessonData = Get-Content $lessonPath | ConvertFrom-Json
                if (-not $lessonData.completed_at) {
                    $allLessonsCompleted = $false
                }
            }
        }

        if ($allLessonsCompleted -and -not $week.completed_at) {
            $week.completed_at = $ts
        }
    }

    $program.updated_at = $ts
    $program | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Auto progression updated for program $ProgramId"
}

