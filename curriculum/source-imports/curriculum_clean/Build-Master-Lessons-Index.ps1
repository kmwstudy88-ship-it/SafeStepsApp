# ============================================
# SafeSteps Master Lessons Index Builder
# ============================================

$Root = "C:\Users\SAFES\safesteps\safesteps-curriculum"
$Output = Join-Path $Root "master-lessons-index.json"

$LessonFiles = Get-ChildItem -Path $Root -Recurse -Filter *.ps1 |
    Where-Object { $_.Name -match "Lesson-" }

$Index = @()

foreach ($file in $LessonFiles) {

    # Extract domain (folder name)
    $Domain = Split-Path $file.DirectoryName -Leaf

    # Extract lesson number
    if ($file.Name -match "Lesson-(\d+)\.ps1") {
        $LessonNumber = $Matches[1]
    } else {
        $LessonNumber = "Unknown"
    }

    # Build entry
    $Entry = [PSCustomObject]@{
        Domain      = $Domain
        LessonID    = $LessonNumber
        FileName    = $file.Name
        FullPath    = $file.FullName
        SizeBytes   = $file.Length
        LastUpdated = $file.LastWriteTime
        Status      = if ($file.Length -lt 300) { "Placeholder" } else { "Complete" }
    }

    $Index += $Entry
}

# Convert to JSON
$Index | ConvertTo-Json -Depth 5 | Set-Content -Path $Output -Encoding UTF8

Write-Host "Master Lessons Index created:"
Write-Host $Output
