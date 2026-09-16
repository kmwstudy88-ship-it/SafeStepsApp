# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 4 of 10 — Construct topic objects
# ================================================

Write-Host "=== PART 4: Constructing topic objects ===" -ForegroundColor Cyan

$Global:FinalTopics = @{}

foreach ($topicSlug in $Global:TopicsIndex.Keys) {

    $entry      = $Global:TopicsIndex[$topicSlug]
    $courseJson = $entry.CourseJson
    $lessonJson = $entry.LessonJson

    $topicObj = [pscustomobject]@{
        slug               = $topicSlug
        title              = $courseJson.title
        description        = $courseJson.description
        estimatedTimeMinutes = $courseJson.estimatedTimeMinutes
        difficultyLevel    = $courseJson.difficultyLevel
        learningOutcomes   = $courseJson.learningOutcomes
        modules            = $courseJson.modules
        metadata           = $courseJson.metadata
        caseworkerSummary  = $courseJson.caseworkerSummary
        sections           = $lessonJson.sections
        courses            = @()   # reserved for future multi-course linkage
    }

    $Global:FinalTopics[$topicSlug] = $topicObj
}

Write-Host "PART 4 complete: Constructed $($FinalTopics.Count) topic objects." -ForegroundColor Green
$Global:ProcessingReport += "Constructed $($FinalTopics.Count) topic objects from course + lesson JSON."
