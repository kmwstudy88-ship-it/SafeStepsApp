# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 2 of 10 — Load topic course + lesson JSON
# ================================================

Write-Host "=== PART 2: Loading topic JSON ===" -ForegroundColor Cyan

$Global:TopicsIndex = @{}

foreach ($folder in $Global:TopicFolders) {

    $courseJson = Read-JsonFile -Path $folder.CourseJson
    $lessonJson = Read-JsonFile -Path $folder.LessonJson

    if (-not $courseJson -or -not $lessonJson) {
        Write-Host "WARN: Skipping topic (invalid JSON): $($folder.Slug)" -ForegroundColor Yellow
        $Global:ProcessingReport += "WARN: Skipped topic $($folder.Slug) due to invalid JSON."
        continue
    }

    $slug = $folder.Slug  # folder name as slug

    $Global:TopicsIndex[$slug] = [pscustomobject]@{
        slug       = $slug
        Folder     = $folder.Path
        CourseJson = $courseJson
        LessonJson = $lessonJson
    }
}

Write-Host "PART 2 complete: Loaded $($TopicsIndex.Count) topics." -ForegroundColor Green
$Global:ProcessingReport += "Loaded $($TopicsIndex.Count) topics from folders."
