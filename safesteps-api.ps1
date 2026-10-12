# SafeSteps Curriculum API Engine

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths

# -------------------------------
# LOADERS
# -------------------------------
function Load-JsonFiles($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { Get-Content $_.FullName -Raw | ConvertFrom-Json } catch { }
        }
}

function Load-Library($name) {
    $file = Join-Path (Join-Path $paths.Root "libraries") $name
    if (Test-Path $file) {
        return (Get-Content $file -Raw | ConvertFrom-Json)
    }
    return @()
}

function Load-Map($name) {
    $file = Join-Path (Join-Path $paths.Root "maps") $name
    if (Test-Path $file) {
        return (Get-Content $file -Raw | ConvertFrom-Json)
    }
    return @()
}

# -------------------------------
# LOAD DATA
# -------------------------------
$programs = Load-JsonFiles $paths.Programs
$stages   = Load-JsonFiles $paths.Stages
$weeks    = Load-JsonFiles $paths.Weeks
$lessons  = Load-JsonFiles $paths.Lessons

$coursesLibrary = Load-Library "courses-library.json"
$topicsLibrary  = Load-Library "topics-library.json"
$lessonsLibrary = Load-Library "lessons-library.json"

$forwardMap = Load-Map "curriculum-forward-map.json"
$reverseMap = Load-Map "curriculum-reverse-map.json"

# -------------------------------
# API FUNCTIONS
# -------------------------------

function Get-Course {
    param([string]$Id)
    return $coursesLibrary | Where-Object { $_.id -eq $Id }
}

function Get-Topic {
    param([string]$Id)
    return $topicsLibrary | Where-Object { $_.id -eq $Id }
}

function Get-Week {
    param([string]$Id)
    return $weeks | Where-Object { $_.id -eq $Id }
}

function Get-Lesson {
    param([string]$Id)
    return $lessons | Where-Object { $_.id -eq $Id }
}

function Get-CourseStructure {
    param([string]$CourseId)
    return $forwardMap | Where-Object { $_.id -eq $CourseId }
}

function Get-LessonPath {
    param([string]$LessonId)
    return $reverseMap | Where-Object { $_.lessonId -eq $LessonId }
}

function Search-Courses {
    param([string]$Query)
    return $coursesLibrary | Where-Object { $_.name -like "*$Query*" -or $_.description -like "*$Query*" }
}

function Search-Topics {
    param([string]$Query)
    return $topicsLibrary | Where-Object { $_.name -like "*$Query*" -or $_.description -like "*$Query*" }
}

function Search-Lessons {
    param([string]$Query)
    return $lessonsLibrary | Where-Object { $_.title -like "*$Query*" -or $_.subject -like "*$Query*" }
}

Write-Host "=== SafeSteps Curriculum API Engine Loaded ===" -ForegroundColor Cyan
Write-Host "Functions available:" -ForegroundColor Yellow
Write-Host "  Get-Course" -ForegroundColor Green
Write-Host "  Get-Topic" -ForegroundColor Green
Write-Host "  Get-Week" -ForegroundColor Green
Write-Host "  Get-Lesson" -ForegroundColor Green
Write-Host "  Get-CourseStructure" -ForegroundColor Green
Write-Host "  Get-LessonPath" -ForegroundColor Green
Write-Host "  Search-Courses" -ForegroundColor Green
Write-Host "  Search-Topics" -ForegroundColor Green
Write-Host "  Search-Lessons" -ForegroundColor Green
