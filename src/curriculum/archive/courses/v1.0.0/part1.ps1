# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 1 of 10 — Config, scanning, JSON helpers
# ================================================

param(
    [string]$BasePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"
)

$Global:BasePath = $BasePath

Write-Host "=== SafeSteps Curriculum Engine v1 ===" -ForegroundColor Cyan
Write-Host "Base path: $BasePath" -ForegroundColor DarkCyan

if (-not (Test-Path -Path $BasePath)) {
    Write-Host "ERROR: Base path does not exist: $BasePath" -ForegroundColor Red
    exit 1
}

function Read-JsonFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path
    )

    if (-not (Test-Path -Path $Path)) {
        return $null
    }

    try {
        $raw = Get-Content -Path $Path -Raw -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($raw)) {
            return $null
        }
        return $raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Host "WARN: Failed to parse JSON: $Path" -ForegroundColor Yellow
        return $null
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][object]$Object
    )

    try {
        $json = $Object | ConvertTo-Json -Depth 20
        $json | Set-Content -Path $Path -Encoding UTF8
    }
    catch {
        Write-Host "ERROR: Failed to write JSON: $Path" -ForegroundColor Red
    }
}

function Merge-JsonObject {
    param(
        [Parameter(Mandatory = $true)][pscustomobject]$Target,
        [Parameter(Mandatory = $true)][pscustomobject]$Source
    )

    $targetHash = @{}
    $Target.PSObject.Properties | ForEach-Object {
        $targetHash[$_.Name] = $true
    }

    $Source.PSObject.Properties | ForEach-Object {
        if (-not $targetHash.ContainsKey($_.Name)) {
            $Target | Add-Member -NotePropertyName $_.Name -NotePropertyValue $_.Value
        }
    }

    return $Target
}

function Normalize-Topic {
    param(
        [Parameter(Mandatory = $true)][pscustomobject]$Topic
    )

    $obj = [pscustomobject]@{}

    $obj | Add-Member -NotePropertyName "slug" -NotePropertyValue ($Topic.slug -or "")
    $obj | Add-Member -NotePropertyName "title" -NotePropertyValue ($Topic.title -or "")
    $obj | Add-Member -NotePropertyName "description" -NotePropertyValue ($Topic.description -or "")
    $obj | Add-Member -NotePropertyName "difficultyLevel" -NotePropertyValue ($Topic.difficultyLevel -or "beginner")
    $obj | Add-Member -NotePropertyName "estimatedTimeMinutes" -NotePropertyValue ($Topic.estimatedTimeMinutes -or 60)

    $obj | Add-Member -NotePropertyName "learningOutcomes" -NotePropertyValue @()
    if ($Topic.learningOutcomes) {
        $obj.learningOutcomes = @($Topic.learningOutcomes | ForEach-Object { "$_" })
    }

    $obj | Add-Member -NotePropertyName "modules" -NotePropertyValue @()
    if ($Topic.modules) {
        $obj.modules = @($Topic.modules)
    }

    $obj | Add-Member -NotePropertyName "sections" -NotePropertyValue @()
    if ($Topic.sections) {
        $obj.sections = @($Topic.sections)
    }

    $obj | Add-Member -NotePropertyName "metadata" -NotePropertyValue @{ }
    if ($Topic.metadata) {
        $obj.metadata = $Topic.metadata
    }

    $obj | Add-Member -NotePropertyName "caseworkerSummary" -NotePropertyValue ($Topic.caseworkerSummary -or "")

    # Optional: keep courses array for future multi-course linkage
    $obj | Add-Member -NotePropertyName "courses" -NotePropertyValue @()
    if ($Topic.courses) {
        $obj.courses = @($Topic.courses)
    }

    return $obj
}

function Get-TopicFolders {
    param(
        [Parameter(Mandatory = $true)][string]$Root
    )

    $folders = Get-ChildItem -Path $Root -Directory -ErrorAction Stop
    $topicFolders = @()

    foreach ($folder in $folders) {
        $courseJsonPath = Join-Path $folder.FullName "course.json"
        $lessonJsonPath = Join-Path $folder.FullName "lesson.json"

        if ((Test-Path $courseJsonPath) -and (Test-Path $lessonJsonPath)) {
            $topicFolders += [pscustomobject]@{
                Slug       = $folder.Name
                Path       = $folder.FullName
                CourseJson = $courseJsonPath
                LessonJson = $lessonJsonPath
            }
        }
        else {
            Write-Host "WARN: Skipping folder (missing course.json or lesson.json): $($folder.FullName)" -ForegroundColor Yellow
        }
    }

    return $topicFolders
}

Write-Host "Scanning topic folders..." -ForegroundColor Cyan
$Global:TopicFolders      = Get-TopicFolders -Root $BasePath
$Global:TopicsIndex       = @{}
$Global:FinalTopics       = @{}
$Global:ProcessingReport  = @()

Write-Host "Found $($TopicFolders.Count) topic folders." -ForegroundColor Green
Write-Host "Part 1 complete: config + scanning ready." -ForegroundColor Cyan
