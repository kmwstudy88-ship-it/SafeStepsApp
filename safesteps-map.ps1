param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Building Curriculum Maps" -Level "INFO"

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
# 1) FORWARD MAP
# -------------------------------
$forwardMap = @()

foreach ($p in $programs) {

    $programNode = [PSCustomObject]@{
        id     = $p.id
        name   = $p.name
        stages = @()
    }

    $programStages = $stages | Where-Object { $_.programId -eq $p.id }

    foreach ($s in $programStages) {

        $stageNode = [PSCustomObject]@{
            id    = $s.id
            name  = $s.name
            weeks = @()
        }

        $stageWeeks = $weeks | Where-Object { $_.stageId -eq $s.id }

        foreach ($w in $stageWeeks) {

            $weekNode = [PSCustomObject]@{
                id      = $w.id
                name    = $w.name
                lessons = @()
            }

            $weekLessons = $lessons | Where-Object { $_.weekId -eq $w.id }

            foreach ($l in $weekLessons) {

                $subject = Get-Fallback $l.subject $l.title

                $lessonNode = [PSCustomObject]@{
                    id      = $l.id
                    title   = $l.title
                    subject = $subject
                }

                $weekNode.lessons += $lessonNode
            }

            $stageNode.weeks += $weekNode
        }

        $programNode.stages += $stageNode
    }

    $forwardMap += $programNode
}

# -------------------------------
# 2) REVERSE MAP
# -------------------------------
$reverseMap = @()

foreach ($l in $lessons) {

    $subject = Get-Fallback $l.subject $l.title

    $entry = [PSCustomObject]@{
        lessonId    = $l.id
        lessonTitle = $l.title
        subject     = $subject
        weekId      = $l.weekId
        weekName    = $null
        stageId     = $null
        stageName   = $null
        programId   = $null
        programName = $null
    }

    $week = $weeks | Where-Object { $_.id -eq $l.weekId }
    if ($week) {
        $entry.weekName = $week.name
        $entry.stageId  = $week.stageId

        $stage = $stages | Where-Object { $_.id -eq $week.stageId }
        if ($stage) {
            $entry.stageName = $stage.name
            $entry.programId = $stage.programId

            $program = $programs | Where-Object { $_.id -eq $stage.programId }
            if ($program) {
                $entry.programName = $program.name
            }
        }
    }

    $reverseMap += $entry
}

# -------------------------------
# OUTPUT
# -------------------------------
$mapsRoot = Join-Path $paths.Root "maps"
if (-not (Test-Path $mapsRoot)) {
    New-Item -ItemType Directory -Path $mapsRoot | Out-Null
}

$forwardMap | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $mapsRoot "curriculum-forward-map.json")
$reverseMap | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $mapsRoot "curriculum-reverse-map.json")

Write-Host "=== Curriculum Maps Built ===" -ForegroundColor Cyan
Write-Host "Programs in forward map: $($forwardMap.Count)" -ForegroundColor Green
Write-Host "Lessons in reverse map:  $($reverseMap.Count)" -ForegroundColor Green

Write-SafeStepsLog -Message "Curriculum maps built successfully" -Level "INFO"
