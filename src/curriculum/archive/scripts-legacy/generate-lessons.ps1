# =====================================================================
# SAFE STEPS — BULK LESSON GENERATOR (FULL PRODUCTION REWRITE)
# =====================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$SubjectsPath = Join-Path $Root "..\subjects"
$LessonsPath  = Join-Path $Root "..\lessons"
$TemplatePath = Join-Path $Root "..\templates\lesson-template.json"

Write-Host "`n=== SAFE STEPS BULK LESSON GENERATOR ===`n"

# ---------------------------------------------------------------------
# 1. Load lesson template
# ---------------------------------------------------------------------
if (!(Test-Path $TemplatePath)) {
    Write-Host "[ERROR] Lesson template not found at $TemplatePath" -ForegroundColor Red
    exit
}

$Template = Get-Content $TemplatePath -Raw | ConvertFrom-Json

# ---------------------------------------------------------------------
# 2. Scan subjects
# ---------------------------------------------------------------------
$SubjectFiles = Get-ChildItem $SubjectsPath -Filter *.json

foreach ($SubjectFile in $SubjectFiles) {

    $SubjectData = Get-Content $SubjectFile.FullName -Raw | ConvertFrom-Json
    $SubjectSlug = $SubjectData.slug
    $SubjectName = $SubjectData.title

    Write-Host "`n[SUBJECT] $SubjectName ($SubjectSlug)"

    foreach ($Topic in $SubjectData.topics) {

        $TopicSlug = $Topic.slug
        $TopicTitle = $Topic.title

        Write-Host "  ├─ [TOPIC] $TopicTitle ($TopicSlug)"

        # Create lesson folder for this topic
        $TopicLessonFolder = Join-Path $LessonsPath $TopicSlug
        if (!(Test-Path $TopicLessonFolder)) {
            New-Item -ItemType Directory -Path $TopicLessonFolder | Out-Null
            Write-Host "  │    [CREATE] Folder created: $TopicLessonFolder"
        }

        # Lesson file path
        $LessonFile = Join-Path $TopicLessonFolder "lesson.json"

        if (Test-Path $LessonFile) {
            Write-Host "  │    [SKIP] Lesson already exists"
            continue
        }

        # -----------------------------------------------------------------
        # 3. Generate lesson JSON from template
        # -----------------------------------------------------------------
        $NewLesson = $Template | ConvertTo-Json -Depth 20 | ConvertFrom-Json

        $NewLesson.id = "lesson_$TopicSlug"
        $NewLesson.slug = $TopicSlug
        $NewLesson.title = $TopicTitle
        $NewLesson.subject = $SubjectSlug
        $NewLesson.topic = $TopicSlug

        # -----------------------------------------------------------------
        # 4. Save lesson file
        # -----------------------------------------------------------------
        $NewLesson | ConvertTo-Json -Depth 20 | Out-File $LessonFile -Encoding utf8

        Write-Host "  │    [GENERATED] $LessonFile"
    }
}

Write-Host "`n=== COMPLETE: All missing lessons generated ===`n"
