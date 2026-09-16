# ============================================
# SAFE STEPS 24-MONTH LESSON → TOPIC CONVERTER
# ============================================

$lessonFolder = "C:\Users\SAFES\safesteps-curriculum\packages\content-courses\full-reunification-24m\v1.0.0\lessons"
$topicOutput  = "C:\Users\SAFES\safesteps-curriculum\topics"
$masterIndex  = "C:\Users\SAFES\safesteps-curriculum\core\topics.master.json"

New-Item -ItemType Directory -Force -Path $topicOutput | Out-Null

if (Test-Path $masterIndex) {
    $master = Get-Content $masterIndex -Raw | ConvertFrom-Json
} else {
    $master = @()
}

function Get-TopicCategory {
    param([string]$text)

    $t = $text.ToLower()

    if ($t -match "violence|safety plan|risk|danger|coercive|protection") { return "Safety & Protection" }
    if ($t -match "resilien|trauma|stress|healing|overwhelm|emotional") { return "Trauma & Healing" }
    if ($t -match "parent|routine|discipline|caregiver|stability") { return "Parenting Skills" }
    if ($t -match "child|development|attachment|behaviour") { return "Child Development" }
    if ($t -match "relationship|communication|conflict|trust") { return "Healthy Relationships" }
    if ($t -match "self-care|wellbeing|burnout|balance") { return "Self-Care & Wellbeing" }

    return "General Parenting"
}

Get-ChildItem -Path $lessonFolder -Filter *.json | ForEach-Object {

    $file = $_.FullName

    try {
        $json = Get-Content $file -Raw | ConvertFrom-Json
    }
    catch {
        Write-Host "⚠️ Invalid JSON, skipping: $($_.Name)"
        return
    }

    if (-not $json.title) {
        Write-Host "⚠️ No title found, skipping: $($_.Name)"
        return
    }

    $safeTitle = $json.title.ToLower() `
        -replace '[^a-z0-9]+' , '-' `
        -replace '-+' , '-' `
        -replace '^-','' `
        -replace '-$',''

    $newFileName = "$safeTitle.json"
    $newFilePath = Join-Path $topicOutput $newFileName

    $combinedText = "$($json.title) $($json.learningGoal) $($json.microLesson)"
    $category = Get-TopicCategory -text $combinedText

    $tags = @()
    if ($json.learningGoal) { $tags += ($json.learningGoal.ToLower() -split " " | Select-Object -Unique) }
    if ($json.caseworkerFlags) { $tags += $json.caseworkerFlags }
    $tags = $tags | Where-Object { $_ -match '^[a-z0-9\-]+$' }

    $topicId = "topic-$safeTitle"

    $topic = [PSCustomObject]@{
        id             = $topicId
        title          = $json.title
        category       = $category
        tags           = $tags
        description    = $json.learningGoal
        sourceLessonId = $json.id
        programsUsedIn = @("24m")
        version        = $json.version
    }

    $topic | ConvertTo-Json -Depth 10 | Set-Content $newFilePath -Encoding UTF8
    Write-Host "✔️ Saved topic: $newFileName"

    if ($master.id -contains $topicId) {
        Write-Host "⚠️ Already in master registry: $topicId"
    }
    else {
        $master += $topic
        Write-Host "➕ Added to master registry: $topicId"
    }
}

$masterSorted = $master | Sort-Object title
$masterSorted | ConvertTo-Json -Depth 10 | Set-Content $masterIndex -Encoding UTF8

Write-Host "`n🎉 DONE — All 24m lessons converted, categorized, renamed, and indexed."
#