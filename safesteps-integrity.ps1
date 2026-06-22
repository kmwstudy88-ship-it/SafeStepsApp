param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Running Curriculum Integrity Engine" -Level "INFO"

function Load-JsonFiles($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try { 
                $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
                return @{ file = $_.FullName; data = $json }
            } catch { }
        }
}

# Load everything
$programFiles = Load-JsonFiles $paths.Programs
$stageFiles   = Load-JsonFiles $paths.Stages
$weekFiles    = Load-JsonFiles $paths.Weeks
$lessonFiles  = Load-JsonFiles $paths.Lessons

# -------------------------------
# Integrity Report Structure
# -------------------------------
$report = [PSCustomObject]@{
    orphanStages     = @()
    orphanWeeks      = @()
    orphanLessons    = @()
    missingTitles    = @()
    missingContent   = @()
    invalidIds       = @()
    duplicateIds     = @()
    duplicateFiles   = @()
    brokenLinks      = @()
    summary          = @{}
}

# -------------------------------
# Helper: ID validation
# -------------------------------
function Is-ValidId {
    param($id)
    if ($null -eq $id -or $id -eq "") { return $false }
    if ($id -match "^[a-z0-9\-]+$") { return $true }
    return $false
}

# -------------------------------
# Detect invalid IDs
# -------------------------------
$allIds = @()

foreach ($p in $programFiles) {
    if (-not (Is-ValidId $p.data.id)) {
        $report.invalidIds += $p.data.id
    }
    $allIds += $p.data.id
}

foreach ($s in $stageFiles) {
    if (-not (Is-ValidId $s.data.id)) {
        $report.invalidIds += $s.data.id
    }
    $allIds += $s.data.id
}

foreach ($w in $weekFiles) {
    if (-not (Is-ValidId $w.data.id)) {
        $report.invalidIds += $w.data.id
    }
    $allIds += $w.data.id
}

foreach ($l in $lessonFiles) {
    if (-not (Is-ValidId $l.data.id)) {
        $report.invalidIds += $l.data.id
    }
    $allIds += $l.data.id
}

# -------------------------------
# Detect duplicate IDs
# -------------------------------
$dupes = $allIds | Group-Object | Where-Object { $_.Count -gt 1 }
foreach ($d in $dupes) {
    $report.duplicateIds += $d.Name
}

# -------------------------------
# Detect orphan stages (no program)
# -------------------------------
foreach ($s in $stageFiles) {
    if ($null -eq $s.data.programId -or $s.data.programId -eq "") {
        $report.orphanStages += $s.data.id
    }
}

# -------------------------------
# Detect orphan weeks (no stage)
# -------------------------------
foreach ($w in $weekFiles) {
    if ($null -eq $w.data.stageId -or $w.data.stageId -eq "") {
        $report.orphanWeeks += $w.data.id
    }
}

# -------------------------------
# Detect orphan lessons (no week)
# -------------------------------
foreach ($l in $lessonFiles) {
    if ($null -eq $l.data.weekId -or $l.data.weekId -eq "") {
        $report.orphanLessons += $l.data.id
    }
}

# -------------------------------
# Detect missing titles / content
# -------------------------------
foreach ($l in $lessonFiles) {
    if ($null -eq $l.data.title -or $l.data.title -eq "") {
        $report.missingTitles += $l.data.id
    }
    if ($null -eq $l.data.content -or $l.data.content -eq "") {
        $report.missingContent += $l.data.id
    }
}

# -------------------------------
# Detect broken links
# -------------------------------
$programIds = $programFiles.data.id
$stageIds   = $stageFiles.data.id
$weekIds    = $weekFiles.data.id

foreach ($s in $stageFiles) {
    if ($s.data.programId -and -not ($programIds -contains $s.data.programId)) {
        $report.brokenLinks += "Stage $($s.data.id) → Missing program $($s.data.programId)"
    }
}

foreach ($w in $weekFiles) {
    if ($w.data.stageId -and -not ($stageIds -contains $w.data.stageId)) {
        $report.brokenLinks += "Week $($w.data.id) → Missing stage $($w.data.stageId)"
    }
}

foreach ($l in $lessonFiles) {
    if ($l.data.weekId -and -not ($weekIds -contains $l.data.weekId)) {
        $report.brokenLinks += "Lesson $($l.data.id) → Missing week $($l.data.weekId)"
    }
}

# -------------------------------
# Summary
# -------------------------------
$report.summary = @{
    orphanStages   = $report.orphanStages.Count
    orphanWeeks    = $report.orphanWeeks.Count
    orphanLessons  = $report.orphanLessons.Count
    missingTitles  = $report.missingTitles.Count
    missingContent = $report.missingContent.Count
    invalidIds     = $report.invalidIds.Count
    duplicateIds   = $report.duplicateIds.Count
    brokenLinks    = $report.brokenLinks.Count
}

# -------------------------------
# OUTPUT
# -------------------------------
$integrityRoot = Join-Path $paths.Root "integrity"
if (-not (Test-Path $integrityRoot)) {
    New-Item -ItemType Directory -Path $integrityRoot | Out-Null
}

$report | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $integrityRoot "integrity-report.json")

Write-Host "=== Curriculum Integrity Report Generated ===" -ForegroundColor Cyan
Write-Host "Broken links: $($report.brokenLinks.Count)" -ForegroundColor Yellow
Write-Host "Orphan lessons: $($report.orphanLessons.Count)" -ForegroundColor Yellow
Write-Host "Missing content: $($report.missingContent.Count)" -ForegroundColor Yellow
Write-Host "Invalid IDs: $($report.invalidIds.Count)" -ForegroundColor Yellow
Write-Host "Duplicate IDs: $($report.duplicateIds.Count)" -ForegroundColor Yellow

Write-SafeStepsLog -Message "Integrity engine completed" -Level "INFO"
