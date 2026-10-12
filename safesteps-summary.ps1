param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Building Curriculum Summary" -Level "INFO"

function Load-JsonFiles($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try {
                Get-Content $_.FullName -Raw | ConvertFrom-Json
            } catch { }
        }
}

# Load curriculum
$programs = Load-JsonFiles $paths.Programs
$stages   = Load-JsonFiles $paths.Stages
$weeks    = Load-JsonFiles $paths.Weeks
$lessons  = Load-JsonFiles $paths.Lessons

# -------------------------------
# BASIC COUNTS
# -------------------------------
$totalCourses = $programs.Count
$totalTopics  = $stages.Count
$totalWeeks   = $weeks.Count
$totalLessons = $lessons.Count

# -------------------------------
# AVERAGES
# -------------------------------
$avgWeeksPerCourse = 0
if ($totalCourses -gt 0) {
    $sumWeeks = 0
    foreach ($p in $programs) {
        $pStages = $stages | Where-Object { $_.programId -eq $p.id }
        foreach ($s in $pStages) {
            if ($s.weeks) { $sumWeeks += $s.weeks.Count }
        }
    }
    $avgWeeksPerCourse = [math]::Round($sumWeeks / $totalCourses, 2)
}

$avgLessonsPerWeek = 0
if ($totalWeeks -gt 0) {
    $sumLessons = 0
    foreach ($w in $weeks) {
        if ($w.lessons) { $sumLessons += $w.lessons.Count }
    }
    $avgLessonsPerWeek = [math]::Round($sumLessons / $totalWeeks, 2)
}

# -------------------------------
# DETECT MISSING LINKS
# -------------------------------
$missingStageLinks = @()
foreach ($s in $stages) {
    if ($null -eq $s.programId -or $s.programId -eq "") {
        $missingStageLinks += $s.id
    }
}

$missingWeekLinks = @()
foreach ($w in $weeks) {
    if ($null -eq $w.stageId -or $w.stageId -eq "") {
        $missingWeekLinks += $w.id
    }
}

$missingLessonLinks = @()
foreach ($l in $lessons) {
    if ($null -eq $l.weekId -or $l.weekId -eq "") {
        $missingLessonLinks += $l.id
    }
}

# -------------------------------
# DETECT EMPTY FIELDS
# -------------------------------
$emptyTitles = @()
foreach ($l in $lessons) {
    if ($null -eq $l.title -or $l.title -eq "") {
        $emptyTitles += $l.id
    }
}

$emptyContent = @()
foreach ($l in $lessons) {
    if ($null -eq $l.content -or $l.content -eq "") {
        $emptyContent += $l.id
    }
}

# -------------------------------
# BUILD SUMMARY OBJECT
# -------------------------------
$summary = [PSCustomObject]@{
    totals = @{
        courses = $totalCourses
        topics  = $totalTopics
        weeks   = $totalWeeks
        lessons = $totalLessons
    }
    averages = @{
        weeksPerCourse   = $avgWeeksPerCourse
        lessonsPerWeek   = $avgLessonsPerWeek
    }
    missingLinks = @{
        stagesMissingProgram = $missingStageLinks
        weeksMissingStage    = $missingWeekLinks
        lessonsMissingWeek   = $missingLessonLinks
    }
    emptyFields = @{
        lessonsMissingTitle   = $emptyTitles
        lessonsMissingContent = $emptyContent
    }
}

# -------------------------------
# OUTPUT
# -------------------------------
$summaryRoot = Join-Path $paths.Root "summary"
if (-not (Test-Path $summaryRoot)) {
    New-Item -ItemType Directory -Path $summaryRoot | Out-Null
}

$summary | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $summaryRoot "curriculum-summary.json")

Write-Host "=== Curriculum Summary Built ===" -ForegroundColor Cyan
Write-Host "Courses: $totalCourses" -ForegroundColor Green
Write-Host "Topics:  $totalTopics" -ForegroundColor Green
Write-Host "Weeks:   $totalWeeks" -ForegroundColor Green
Write-Host "Lessons: $totalLessons" -ForegroundColor Green

Write-SafeStepsLog -Message "Curriculum summary built successfully" -Level "INFO"
