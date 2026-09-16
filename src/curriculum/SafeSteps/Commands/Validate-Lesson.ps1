. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Lesson {
    param([string]$Id)

    $lesson = Get-Lesson -Id $Id

    if (-not $lesson.id) { Write-Warning "Missing: id" }
    if (-not $lesson.title) { Write-Warning "Missing: title" }
    if (-not $lesson.objectives) { Write-Warning "Missing: objectives" }
    if (-not $lesson.activities) { Write-Warning "Missing: activities" }
    if (-not $lesson.evidence) { Write-Warning "Missing: evidence" }

    Write-Host "Lesson validation complete."
}

