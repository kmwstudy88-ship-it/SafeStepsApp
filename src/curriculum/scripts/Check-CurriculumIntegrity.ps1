param(
    [string]$TopicsDir  = ".\topics",
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections"
)

Write-Host "=== Check-CurriculumIntegrity.ps1 ==="

function Test-JsonFile {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        Write-Warning ("[MISS] File not found: {0}" -f $Path)
        return $null
    }

    try {
        $raw = Get-Content $Path -Raw
        $obj = $raw | ConvertFrom-Json
        return $obj
    }
    catch {
        $err = $_ | Out-String
        Write-Error ("[JSON] Malformed JSON in {0}: {1}" -f $Path, $err)
        return $null
    }
}

Write-Host "Scanning topics, modules, lessons, sections..."

# --- Collect files ---
$topicFiles   = Get-ChildItem $TopicsDir   -Filter *.json -ErrorAction SilentlyContinue
$moduleFiles  = Get-ChildItem $ModulesDir  -Filter *.json -ErrorAction SilentlyContinue
$lessonFiles  = Get-ChildItem $LessonsDir  -Filter *.json -ErrorAction SilentlyContinue
$sectionFiles = Get-ChildItem $SectionsDir -Filter *.json -ErrorAction SilentlyContinue

Write-Host ("Topics:   {0}" -f $topicFiles.Count)
Write-Host ("Modules:  {0}" -f $moduleFiles.Count)
Write-Host ("Lessons:  {0}" -f $lessonFiles.Count)
Write-Host ("Sections: {0}" -f $sectionFiles.Count)

# --- Index by ID from filename ---
$modulesById  = @{}
$lessonsById  = @{}
$sectionsById = @{}

foreach ($m in $moduleFiles) {
    $id = [System.IO.Path]::GetFileNameWithoutExtension($m.Name)
    $modulesById[$id] = $m.FullName
}

foreach ($l in $lessonFiles) {
    $id = [System.IO.Path]::GetFileNameWithoutExtension($l.Name)
    $lessonsById[$id] = $l.FullName
}

foreach ($s in $sectionFiles) {
    $id = [System.IO.Path]::GetFileNameWithoutExtension($s.Name)
    $sectionsById[$id] = $s.FullName
}

# --- Check topics ---
Write-Host ""
Write-Host "=== TOPIC CHECK ==="

foreach ($tf in $topicFiles) {
    $topic = Test-JsonFile -Path $tf.FullName
    if (-not $topic) { continue }

    $tid = $topic.topicId
    if (-not $tid) {
        Write-Warning ("[TOPIC] {0} missing topicId" -f $tf.Name)
        continue
    }

    if (-not $topic.modules) {
        Write-Warning ("[TOPIC] {0} ({1}) has no 'modules' array" -f $tf.Name, $tid)
        continue
    }

    if ($topic.modules.Count -eq 0) {
        Write-Warning ("[TOPIC] {0} ({1}) modules array is empty" -f $tf.Name, $tid)
        continue
    }

    foreach ($modRef in $topic.modules) {
        $mid = $modRef.id
        if (-not $mid) {
            Write-Warning ("[TOPIC] {0} ({1}) has module with no 'id'" -f $tf.Name, $tid)
            continue
        }

        if (-not $modulesById.ContainsKey($mid)) {
            Write-Warning ("[TOPIC] {0} ({1}) references missing module: {2}" -f $tf.Name, $tid, $mid)
        }
        else {
            Write-Host ("[OK] Topic {0} → module {1}" -f $tid, $mid)
        }
    }
}

# --- Check modules ---
Write-Host ""
Write-Host "=== MODULE CHECK ==="

foreach ($mf in $moduleFiles) {
    $module = Test-JsonFile -Path $mf.FullName
    if (-not $module) { continue }

    $mid = $module.id
    if (-not $mid) {
        Write-Warning ("[MODULE] {0} missing 'id'" -f $mf.Name)
        continue
    }

    if (-not $module.lessons) {
        Write-Warning ("[MODULE] {0} ({1}) has no 'lessons' array" -f $mf.Name, $mid)
        continue
    }

    if ($module.lessons.Count -eq 0) {
        Write-Warning ("[MODULE] {0} ({1}) lessons array is empty" -f $mf.Name, $mid)
        continue
    }

    foreach ($lesRef in $module.lessons) {
        $lid = $lesRef.id
        if (-not $lid) {
            Write-Warning ("[MODULE] {0} ({1}) has lesson with no 'id'" -f $mf.Name, $mid)
            continue
        }

        if (-not $lessonsById.ContainsKey($lid)) {
            Write-Warning ("[MODULE] {0} ({1}) references missing lesson: {2}" -f $mf.Name, $mid, $lid)
        }
        else {
            Write-Host ("[OK] Module {0} → lesson {1}" -f $mid, $lid)
        }
    }
}

# --- Check lessons ---
Write-Host ""
Write-Host "=== LESSON CHECK ==="

foreach ($lf in $lessonFiles) {
    $lesson = Test-JsonFile -Path $lf.FullName
    if (-not $lesson) { continue }

    $lid = $lesson.id
    if (-not $lid) {
        Write-Warning ("[LESSON] {0} missing 'id'" -f $lf.Name)
        continue
    }

    if (-not $lesson.sections) {
        Write-Warning ("[LESSON] {0} ({1}) has no 'sections' array" -f $lf.Name, $lid)
        continue
    }

    if ($lesson.sections.Count -eq 0) {
        Write-Warning ("[LESSON] {0} ({1}) sections array is empty" -f $lf.Name, $lid)
        continue
    }

    foreach ($secRef in $lesson.sections) {
        $sid = $secRef.id
        if (-not $sid) {
            Write-Warning ("[LESSON] {0} ({1}) has section with no 'id'" -f $lf.Name, $lid)
            continue
        }

        if (-not $sectionsById.ContainsKey($sid)) {
            Write-Warning ("[LESSON] {0} ({1}) references missing section: {2}" -f $lf.Name, $lid, $sid)
        }
        else {
            Write-Host ("[OK] Lesson {0} → section {1}" -f $lid, $sid)
        }
    }
}

Write-Host ""
Write-Host "Curriculum integrity check complete."
