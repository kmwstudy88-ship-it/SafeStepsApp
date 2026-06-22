param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Building Curriculum Libraries" -Level "INFO"

function Load-JsonFiles($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try {
                Get-Content $_.FullName -Raw | ConvertFrom-Json
            } catch { }
        }
}

# Load all curriculum entities
$programs = Load-JsonFiles $paths.Programs
$stages   = Load-JsonFiles $paths.Stages
$weeks    = Load-JsonFiles $paths.Weeks
$lessons  = Load-JsonFiles $paths.Lessons

# Helper: Safe fallback
function Get-Fallback {
    param($value, $fallback)
    if ($null -eq $value -or $value -eq "") { return $fallback }
    return $value
}

# -------------------------------
# 1) COURSES LIBRARY
# -------------------------------
$coursesLibrary = @()

foreach ($p in $programs) {

    $desc = Get-Fallback $p.description ("Course: " + $p.name)

    $course = [PSCustomObject]@{
        id          = $p.id
        name        = $p.name
        type        = "course"
        description = $desc
        stagesCount = 0
        weeksCount  = 0
    }

    if ($p.stages) {
        $course.stagesCount = $p.stages.Count

        $linkedStages = $stages | Where-Object { $p.stages -contains $_.id }
        foreach ($s in $linkedStages) {
            if ($s.weeks) {
                $course.weeksCount += $s.weeks.Count
            }
        }
    }

    $coursesLibrary += $course
}

# -------------------------------
# 2) TOPICS / MODULES LIBRARY
# -------------------------------
$topicsLibrary = @()

foreach ($s in $stages) {

    $desc = Get-Fallback $s.description ("Topic/Module: " + $s.name)

    $weeksCount = 0
    if ($s.weeks) { $weeksCount = $s.weeks.Count }

    $topic = [PSCustomObject]@{
        id          = $s.id
        name        = $s.name
        type        = "topic"
        programId   = $s.programId
        description = $desc
        weeksCount  = $weeksCount
    }

    $topicsLibrary += $topic
}

# -------------------------------
# 3) LESSONS LIBRARY
# -------------------------------
$lessonsLibrary = @()

foreach ($l in $lessons) {

    $subject = Get-Fallback $l.subject $l.title

    $lesson = [PSCustomObject]@{
        id        = $l.id
        title     = $l.title
        subject   = $subject
        weekId    = $l.weekId
        stageId   = $null
        programId = $null
        type      = "lesson"
    }

    # Resolve stage + program via week
    $week = $weeks | Where-Object { $_.id -eq $l.weekId }
    if ($week) {
        $lesson.stageId = $week.stageId

        $stage = $stages | Where-Object { $_.id -eq $week.stageId }
        if ($stage) {
            $lesson.programId = $stage.programId
        }
    }

    $lessonsLibrary += $lesson
}

# -------------------------------
# OUTPUT LIBRARIES
# -------------------------------
$libraryRoot = Join-Path $paths.Root "libraries"
if (-not (Test-Path $libraryRoot)) {
    New-Item -ItemType Directory -Path $libraryRoot | Out-Null
}

$coursesLibrary | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $libraryRoot "courses-library.json")
$topicsLibrary  | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $libraryRoot "topics-library.json")
$lessonsLibrary | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $libraryRoot "lessons-library.json")

Write-Host "=== Curriculum Libraries Built ===" -ForegroundColor Cyan
Write-Host "Courses: $($coursesLibrary.Count)" -ForegroundColor Green
Write-Host "Topics:  $($topicsLibrary.Count)" -ForegroundColor Green
Write-Host "Lessons: $($lessonsLibrary.Count)" -ForegroundColor Green

Write-SafeStepsLog -Message "Curriculum libraries built successfully" -Level "INFO"
