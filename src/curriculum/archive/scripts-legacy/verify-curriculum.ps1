# ============================================================
#  SafeSteps Curriculum Integrity Checker (Full System Scan)
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"

Write-Host "Running full curriculum integrity check..."
Write-Host "---------------------------------------------------"

$allJsonFiles = Get-ChildItem $basePath -Recurse -Filter *.json

$invalidFiles = @()
$missingFields = @()
$validCount = 0

# Fields every lesson should have
$requiredLessonFields = @(
    "parentSummary",
    "caseworkerSummary",
    "workerGuidance",
    "riskFlags",
    "safetyIndicators",
    "keywords",
    "contentWarnings",
    "emotionalLoad",
    "recommendedSequence",
    "relatedLessons"
)

foreach ($file in $allJsonFiles) {

    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json -ErrorAction Stop
        $validCount++
    }
    catch {
        $invalidFiles += $file.FullName
        continue
    }

    # Only check lesson.json files for required fields
    if ($file.Name -eq "lesson.json") {

        foreach ($field in $requiredLessonFields) {
            if (-not $json.PSObject.Properties.Match($field)) {
                $missingFields += "$($file.FullName) → missing: $field"
            }
        }
    }
}

Write-Host "`n---------------------------------------------------"
Write-Host "VALIDATION SUMMARY"
Write-Host "---------------------------------------------------"
Write-Host "Total JSON files scanned: $($allJsonFiles.Count)"
Write-Host "Valid JSON files:        $validCount"
Write-Host "Invalid JSON files:      $($invalidFiles.Count)"
Write-Host "Lessons missing fields:  $($missingFields.Count)"

if ($invalidFiles.Count -gt 0) {
    Write-Host "`n❌ INVALID JSON FILES:"
    $invalidFiles | ForEach-Object { Write-Host " - $_" }
}

if ($missingFields.Count -gt 0) {
    Write-Host "`n⚠️ LESSONS WITH MISSING FIELDS:"
    $missingFields | ForEach-Object { Write-Host " - $_" }
}

# Preview 3 random lessons
Write-Host "`n---------------------------------------------------"
Write-Host "SAMPLE LESSON PREVIEW (3 random lessons)"
Write-Host "---------------------------------------------------"

$sampleLessons = Get-ChildItem $basePath -Recurse -Filter lesson.json | Get-Random -Count 3

foreach ($lesson in $sampleLessons) {
    Write-Host "`n--- $($lesson.FullName) ---"
    try {
        $json = Get-Content $lesson.FullName -Raw | ConvertFrom-Json
        $json | Select-Object title, emotionalLoad, recommendedSequence, keywords, relatedLessons
    }
    catch {
        Write-Host "❌ Could not read this lesson."
    }
}

Write-Host "`n---------------------------------------------------"
Write-Host "Integrity check complete."
Write-Host "---------------------------------------------------"
