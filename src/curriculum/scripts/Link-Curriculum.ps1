param(
    [string]$TopicsDir  = ".\topics",
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons"
)

Write-Host "=== Link-Curriculum.ps1 ==="

function Load-Json {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON: $Path"
        return $null
    }
}

# Load all files
$topicFiles  = Get-ChildItem $TopicsDir  -Filter *.json
$moduleFiles = Get-ChildItem $ModulesDir -Filter *.json
$lessonFiles = Get-ChildItem $LessonsDir -Filter *.json

# Index modules and lessons by ID
$modulesById = @{}
foreach ($mf in $moduleFiles) {
    $m = Load-Json $mf.FullName
    if ($m -and $m.id) { $modulesById[$m.id] = $m }
}

$lessonsById = @{}
foreach ($lf in $lessonFiles) {
    $l = Load-Json $lf.FullName
    if ($l -and $l.id) { $lessonsById[$l.id] = $l }
}

# --- AUTO‑LINK LESSONS TO MODULES ---
Write-Host "`nLinking lessons to modules..."

foreach ($module in $modulesById.Values) {

    # Ensure lessons array exists
    if (-not $module.lessons -or $module.lessons -isnot [System.Collections.IEnumerable]) {
        $module.lessons = @()
    }

    # Match lessons by prefix: moduleId_xxx
    $prefix = $module.id + "_"
    $matchedLessons = $lessonsById.Keys | Where-Object { $_ -like "$prefix*" }

    foreach ($lid in $matchedLessons) {
        if ($module.lessons.id -notcontains $lid) {
            $module.lessons += @{ id = $lid }
            Write-Host "[OK] Module $($module.id) → lesson $lid"
        }
    }
}

# --- AUTO‑LINK MODULES TO TOPICS ---
Write-Host "`nLinking modules to topics..."

foreach ($tf in $topicFiles) {
    $topic = Load-Json $tf.FullName
    if (-not $topic) { continue }

    # Ensure modules array exists
    if (-not $topic.modules -or $topic.modules -isnot [System.Collections.IEnumerable]) {
        $topic.modules = @()
    }

    # Match modules by prefix: topicId_xxx
    $prefix = $topic.topicId + "_"
    $matchedModules = $modulesById.Keys | Where-Object { $_ -like "$prefix*" }

    foreach ($mid in $matchedModules) {
        if ($topic.modules.id -notcontains $mid) {
            $topic.modules += @{ id = $mid }
            Write-Host "[OK] Topic $($topic.topicId) → module $mid"
        }
    }

    # Save updated topic
    $topic | ConvertTo-Json -Depth 20 | Set-Content $tf.FullName -Encoding UTF8
}

# --- SAVE UPDATED MODULES ---
Write-Host "`nSaving updated modules..."

foreach ($mf in $moduleFiles) {
    $id = [System.IO.Path]::GetFileNameWithoutExtension($mf.Name)
    $module = $modulesById[$id]
    if ($module) {
        $module | ConvertTo-Json -Depth 20 | Set-Content $mf.FullName -Encoding UTF8
    }
}

Write-Host "`nCurriculum linking complete."
