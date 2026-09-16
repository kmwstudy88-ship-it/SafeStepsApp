# ============================================================
#  SafeSteps Curriculum Engine — Phase One Build Script
# ============================================================

Write-Host "==============================================="
Write-Host "   SafeSteps Curriculum Engine — Phase One"
Write-Host "==============================================="

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $repoRoot -Parent

$modulesPath = Join-Path $repoRoot "modules"
$lessonsPath = Join-Path $repoRoot "lessons"
$scriptsPath = Join-Path $repoRoot "scripts"

Write-Host "`n[1/6] Validating folder structure..."

if (-not (Test-Path $modulesPath)) {
    Write-Host "ERROR: modules folder not found at $modulesPath" -ForegroundColor Red
    exit
}

if (-not (Test-Path $lessonsPath)) {
    Write-Host "lessons folder missing — creating it..."
    New-Item -ItemType Directory -Path $lessonsPath | Out-Null
}

Write-Host "Folder structure OK."

Write-Host "`n[2/6] Merging modules..."
pwsh (Join-Path $scriptsPath "Merge-Modules.ps1")

Write-Host "`n[3/6] Generating curriculum index..."
pwsh (Join-Path $scriptsPath "Generate-CurriculumIndex.ps1")

Write-Host "`n[4/6] Generating lesson files..."
pwsh (Join-Path $scriptsPath "Generate-Lessons.ps1")

Write-Host "`n[5/6] Generating curriculum map..."
pwsh (Join-Path $scriptsPath "Generate-CurriculumMap.ps1")

Write-Host "`n[6/6] Phase One Build Complete!" -ForegroundColor Green
Write-Host "-----------------------------------------------"
Write-Host "Generated files:"
Write-Host " - curriculum_all_modules.json"
Write-Host " - curriculum_index.json"
Write-Host " - curriculum_map.json"
Write-Host "Lesson files created in /lessons"
Write-Host "-----------------------------------------------"
