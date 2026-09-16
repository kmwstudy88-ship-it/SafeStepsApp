# ============================================================
#  SafeSteps Curriculum Cleanup Script (SAFE ARCHIVE MODE)
#  Moves all legacy folders/scripts into /archive
#  Keeps ONLY Phase One curriculum engine structure
# ============================================================

Write-Host "==============================================="
Write-Host "   SafeSteps Curriculum Cleanup (SAFE MODE)"
Write-Host "==============================================="

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $repoRoot -Parent

$archiveRoot = Join-Path $repoRoot "archive"
$archiveScripts = Join-Path $archiveRoot "scripts-legacy"

# Create archive folders if missing
if (-not (Test-Path $archiveRoot)) {
    New-Item -ItemType Directory -Path $archiveRoot | Out-Null
}

if (-not (Test-Path $archiveScripts)) {
    New-Item -ItemType Directory -Path $archiveScripts | Out-Null
}

Write-Host "Archive folders ready."

# ------------------------------------------------------------
# Legacy folders to archive
# ------------------------------------------------------------
$legacyFolders = @(
    "bulk",
    "content",
    "core",
    "courses",
    "curriculum",
    "data",
    "logs",
    "master index",
    "master production index",
    "node_modules",
    "packages",
    "schemas",
    "screens",
    "source",
    "tools",
    "topics",
    "tracks",
    "types"
)

foreach ($folder in $legacyFolders) {
    $path = Join-Path $repoRoot $folder
    if (Test-Path $path) {
        Write-Host "Archiving folder: $folder"
        Move-Item -Path $path -Destination $archiveRoot -Force
    }
}

# ------------------------------------------------------------
# Legacy scripts to archive
# ------------------------------------------------------------
$legacyScripts = @(
    "addMonthToLessons.js",
    "convert-24m-lessons-to-topics.ps1",
    "convert-lessons-to-master-index.ps1",
    "convert-lessons-to-topic-files.ps1",
    "create-24m-lesson-files.ps1",
    "create-topic-files.ps1",
    "generate-all-courses.ps1",
    "generate-aod-course.ps1",
    "generate-caseworker-summaries.ps1",
    "generate-learning-outcomes.ps1",
    "generate-lesson-caseworker-summaries.ps1",
    "generate-lesson.ps1",
    "generate-lessons.ps1",
    "generate-lookup-index.ps1",
    "generate-master-index.ps1",
    "generate-module-keywords.ps1",
    "generate-modules.ps1",
    "reunification-24m.ps1",
    "run-all.ps1",
    "verify-curriculum.ps1"
)

$scriptsPath = Join-Path $repoRoot "scripts"

foreach ($script in $legacyScripts) {
    $scriptPath = Join-Path $scriptsPath $script
    if (Test-Path $scriptPath) {
        Write-Host "Archiving script: $script"
        Move-Item -Path $scriptPath -Destination $archiveScripts -Force
    }
}

Write-Host "`nCleanup complete!" -ForegroundColor Green
Write-Host "Legacy content moved to /archive"
Write-Host "Your Phase One curriculum engine is now clean and ready."
