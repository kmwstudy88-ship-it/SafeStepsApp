param(
    [string]$ModulesDir = ".\modules",
    [string]$LessonsDir = ".\lessons",
    [string]$SectionsDir = ".\sections",
    [string]$CoursesDir = ".\courses"
)

Write-Host "=== Generate-Courses.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try {
        return (Get-Content $Path -Raw | ConvertFrom-Json)
    }
    catch {
        Write-Warning "Malformed JSON → $Path"
        return $null
    }
}

# Ensure output directory exists
New-Item -ItemType Directory -Path $CoursesDir -ErrorAction SilentlyContinue | Out-Null

$moduleFiles = Get-ChildItem $ModulesDir -Filter *.json

foreach ($mf in $moduleFiles) {

    $module = Load-JsonSafe $mf.FullName
    if (-not $module) { continue }

    if (-not $module.id) {
        Write-Warning "[MODULE] $($mf.Name) missing 'id'"
        continue
    }

    # ⭐ REBUILD MODULE OBJECT
    $newModule = [ordered]@{}
    foreach ($prop in $module.PSObject.Properties) {
        $newModule[$prop.Name] = $prop.Value
    }

    # Ensure lessons exists
    if (-not $newModule.Contains("lessons") -or
        $newModule["lessons"] -eq $null -or
        $newModule["lessons"] -isnot [System.Collections.IEnumerable]) {

        Write-Host "[FIX] Rebuilding 'lessons' → $($module.id)"
        $newModule["lessons"] = @()
    }

    # Build course object
    $courseId = "course_{0}" -f $module.id
    $coursePath = Join-Path $CoursesDir "$courseId.json"

    Write-Host "[COURSE] Building → $courseId"

    $courseObj = [ordered]@{
        id          = $courseId
        title       = $module.title
        description = "Auto-generated course for module $($module.id)"
        lessons     = @()
    }

    # Process lessons
    foreach ($lessonRef in $newModule["lessons"]) {

        $lessonId = $lessonRef.id
        $lessonPath = Join-Path $LessonsDir "$lessonId.json"

        if (-not (Test-Path $lessonPath)) {
            Write-Warning "[MISSING] Lesson file not found → $lessonId"
            continue
        }

        $lesson = Load-JsonSafe $lessonPath
        if (-not $lesson) { continue }

        # ⭐ REBUILD LESSON OBJECT
        $newLesson = [ordered]@{}
        foreach ($prop in $lesson.PSObject.Properties) {
            $newLesson[$prop.Name] = $prop.Value
        }

        # Ensure sections exists
        if (-not $newLesson.Contains("sections") -or
            $newLesson["sections"] -eq $null -or
            $newLesson["sections"] -isnot [System.Collections.IEnumerable]) {

            Write-Host "[FIX] Rebuilding 'sections' → $lessonId"
            $newLesson["sections"] = @()
        }

        # Add lesson to course
        $courseObj["lessons"] += $newLesson
    }

    # Save course file
    $courseObj | ConvertTo-Json -Depth 50 | Set-Content $coursePath -Encoding UTF8
}

Write-Host "`nCourse generation complete."
