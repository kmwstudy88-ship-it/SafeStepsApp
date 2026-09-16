# === CONFIG ===
$root = "C:\Users\SAFES\safesteps-curriculum\courses"

$fatherTrack    = Join-Path $root "behaviour-change-accountability-fathers"
$universalTrack = Join-Path $root "accountability-behaviour-change-universal"

# Reference the track variables so they're recognized as used by static analysis
Write-Host "Tracks: father=[$fatherTrack], universal=[$universalTrack]"

function Write-CourseJson {
    param(
        [string]$trackFolder,
        [string]$courseId,
        [string]$jsonContent
    )

    $coursePath = Join-Path $trackFolder $courseId
    $filePath   = Join-Path $coursePath "course.json"

    $jsonContent | Set-Content -Path $filePath -Encoding UTF8
    Write-Host "Wrote JSON for $courseId in $trackFolder"
}
