# =====================================================================
# SAFE STEPS — CURRICULUM INDEX EXPORTER (FULL PRODUCTION VERSION)
# =====================================================================

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$SubjectsPath = Join-Path $Root "..\subjects"
$TopicsPath   = Join-Path $Root "..\topics"
$LessonsPath  = Join-Path $Root "..\lessons"
$OutputFile   = Join-Path $Root "..\curriculum-index.json"

Write-Host "`n=== SAFE STEPS — EXPORTING CURRICULUM INDEX ===`n"

$Index = [ordered]@{
    generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    subjects     = @()
    topics       = @()
    lessons      = @()
}

# ---------------------------------------------------------------------
# 1. SUBJECTS
# ---------------------------------------------------------------------
$SubjectFiles = Get-ChildItem $SubjectsPath -Filter *.json

foreach ($File in $SubjectFiles) {
    $Data = Get-Content $File.FullName -Raw | ConvertFrom-Json

    $Index.subjects += [ordered]@{
        id     = $Data.id
        slug   = $Data.slug
        title  = $Data.title
        path   = $File.FullName
        topics = $Data.topics.slug
    }

    Write-Host "[SUBJECT] $($Data.title)"
}

# ---------------------------------------------------------------------
# 2. TOPICS
# ---------------------------------------------------------------------
$TopicFiles = Get-ChildItem $TopicsPath -Filter *.json -Recurse

foreach ($File in $TopicFiles) {
    $Data = Get-Content $File.FullName -Raw | ConvertFrom-Json

    $Index.topics += [ordered]@{
        id       = $Data.id
        slug     = $Data.slug
        title    = $Data.title
        subject  = $Data.subject
        path     = $File.FullName
        lessons  = @()  # filled in next section
    }

    Write-Host "[TOPIC] $($Data.title)"
}

# ---------------------------------------------------------------------
# 3. LESSONS
# ---------------------------------------------------------------------
$LessonFiles = Get-ChildItem $LessonsPath -Filter lesson.json -Recurse

foreach ($File in $LessonFiles) {
    $Data = Get-Content $File.FullName -Raw | ConvertFrom-Json

    $Index.lessons += [ordered]@{
        id      = $Data.id
        slug    = $Data.slug
        title   = $Data.title
        subject = $Data.subject
        topic   = $Data.topic
        path    = $File.FullName
    }

    Write-Host "[LESSON] $($Data.title)"
}

# ---------------------------------------------------------------------
# 4. LINK LESSONS TO TOPICS
# ---------------------------------------------------------------------
foreach ($Topic in $Index.topics) {
    $Topic.lessons = $Index.lessons |
        Where-Object { $_.topic -eq $Topic.slug } |
        Select-Object -ExpandProperty id
}

# ---------------------------------------------------------------------
# 5. SAVE OUTPUT
# ---------------------------------------------------------------------
$Index | ConvertTo-Json -Depth 20 | Out-File $OutputFile -Encoding utf8

Write-Host "`n=== COMPLETE: curriculum-index.json generated ===`n"
Write-Host "Location: $OutputFile`n"
