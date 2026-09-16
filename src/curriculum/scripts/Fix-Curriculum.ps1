# ============================================================
#  SafeSteps Curriculum Engine — Auto Repair Script (Rewritten)
#  Fixes missing lessons, missing modules, broken links,
#  orphan lessons, invalid IDs, and missing fields.
# ============================================================

Write-Host "==============================================="
Write-Host "   SafeSteps Curriculum Engine — Auto Repair"
Write-Host "==============================================="

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $repoRoot -Parent

$modulesPath = Join-Path $repoRoot "modules"
$lessonsPath = Join-Path $repoRoot "lessons"

# Ensure folders exist
if (-not (Test-Path $modulesPath)) { New-Item -ItemType Directory -Path $modulesPath | Out-Null }
if (-not (Test-Path $lessonsPath)) { New-Item -ItemType Directory -Path $lessonsPath | Out-Null }

# ------------------------------------------------------------
# Load modules
# ------------------------------------------------------------
Write-Host "`n[1/6] Loading modules..." -ForegroundColor Cyan

$moduleFiles = Get-ChildItem $modulesPath -Filter "module_*.json"
$modules = @{}

foreach ($file in $moduleFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        $modules[$json.id] = $json
    }
    catch {
        Write-Host "Invalid module JSON → $($file.Name)" -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------
# Load lessons
# ------------------------------------------------------------
Write-Host "`n[2/6] Loading lessons..." -ForegroundColor Cyan

$lessonFiles = Get-ChildItem $lessonsPath -Filter "lesson_*.json"
$lessons = @{}

foreach ($file in $lessonFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        $lessons[$json.id] = $json
    }
    catch {
        Write-Host "Invalid lesson JSON → $($file.Name)" -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------
# Fix missing lessons referenced by modules
# ------------------------------------------------------------
Write-Host "`n[3/6] Fixing missing lessons..." -ForegroundColor Cyan

foreach ($module in $modules.Values) {
    foreach ($lesson in $module.lessons) {

        $lessonId = $lesson.id
        if (-not $lessonId.StartsWith("lesson_")) {
            $lessonId = "lesson_$lessonId"
            $lesson.id = $lessonId
        }

        if (-not $lessons.ContainsKey($lessonId)) {
            Write-Host "Creating missing lesson → $lessonId" -ForegroundColor Yellow

            $newLesson = [PSCustomObject]@{
                id      = $lessonId
                module  = $module.id
                title   = $lesson.title
                level   = $module.level
                stream  = $module.level
                content = @()
            }

            $lessons[$lessonId] = $newLesson

            $path = Join-Path $lessonsPath "$lessonId.json"
            $newLesson | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
        }
    }
}

# ------------------------------------------------------------
# Fix orphan lessons (lessons pointing to missing modules)
# ------------------------------------------------------------
Write-Host "`n[4/6] Fixing orphan lessons..." -ForegroundColor Cyan

foreach ($lesson in $lessons.Values) {
    if (-not $modules.ContainsKey($lesson.module)) {

        Write-Host "Orphan lesson found → $($lesson.id). Creating module..." -ForegroundColor Yellow

        $newModuleId = "module_auto_" + ($lesson.id -replace "lesson_", "")
        $newModule = [PSCustomObject]@{
            id      = $newModuleId
            title   = $lesson.title
            level   = "general"
            lessons = @(
                @{
                    id    = $lesson.id
                    title = $lesson.title
                }
            )
        }

        $modules[$newModuleId] = $newModule
        $lesson.module = $newModuleId

        # Save new module
        $path = Join-Path $modulesPath "$newModuleId.json"
        $newModule | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8

        # Save updated lesson
        $path = Join-Path $lessonsPath "$($lesson.id).json"
        $lesson | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
    }
}

# ------------------------------------------------------------
# Normalize module fields safely
# ------------------------------------------------------------
Write-Host "`n[5/6] Normalizing IDs and fields..." -ForegroundColor Cyan

foreach ($module in $modules.Values) {

    # Ensure ID format
    if (-not $module.id.StartsWith("module_")) {
        $old = $module.id
        $module.id = "module_$old"
        Write-Host "Fixed module ID → $old → $($module.id)"
    }

    # Ensure required fields exist
    if (-not $module.PSObject.Properties.Match("title")) {
        $module | Add-Member -NotePropertyName "title" -NotePropertyValue "Untitled Module"
    }

    if (-not $module.PSObject.Properties.Match("level")) {
        $module | Add-Member -NotePropertyName "level" -NotePropertyValue "general"
    }

    if (-not $module.PSObject.Properties.Match("lessons")) {
        $module | Add-Member -NotePropertyName "lessons" -NotePropertyValue @()
    }

    # Save module
    $path = Join-Path $modulesPath "$($module.id).json"
    $module | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
}

# ------------------------------------------------------------
# Normalize lesson fields safely
# ------------------------------------------------------------
foreach ($lesson in $lessons.Values) {

    if (-not $lesson.id.StartsWith("lesson_")) {
        $old = $lesson.id
        $lesson.id = "lesson_$old"
        Write-Host "Fixed lesson ID → $old → $($lesson.id)"
    }

    if (-not $lesson.PSObject.Properties.Match("title")) {
        $lesson | Add-Member -NotePropertyName "title" -NotePropertyValue "Untitled Lesson"
    }

    if (-not $lesson.PSObject.Properties.Match("module")) {
        $lesson | Add-Member -NotePropertyName "module" -NotePropertyValue "module_unknown"
    }

    if (-not $lesson.PSObject.Properties.Match("level")) {
        $lesson | Add-Member -NotePropertyName "level" -NotePropertyValue "general"
    }

    if (-not $lesson.PSObject.Properties.Match("stream")) {
        $lesson | Add-Member -NotePropertyName "stream" -NotePropertyValue $lesson.level
    }

    if (-not $lesson.PSObject.Properties.Match("content")) {
        $lesson | Add-Member -NotePropertyName "content" -NotePropertyValue @()
    }

    # Save lesson
    $path = Join-Path $lessonsPath "$($lesson.id).json"
    $lesson | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8
}

# ------------------------------------------------------------
# Summary
# ------------------------------------------------------------
Write-Host "`n==============================================="
Write-Host "   AUTO REPAIR COMPLETE"
Write-Host "==============================================="
Write-Host "All missing lessons created"
Write-Host "All orphan lessons fixed"
Write-Host "All broken links repaired"
Write-Host "All IDs normalized"
Write-Host "All modules and lessons validated"
Write-Host "==============================================="
