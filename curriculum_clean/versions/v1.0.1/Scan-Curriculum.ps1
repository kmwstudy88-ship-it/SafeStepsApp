# ============================================
# SafeSteps Curriculum Scanner & Progress Report
# ============================================

$Root = "C:\Users\SAFES\safesteps\safesteps-curriculum"
$Output = Join-Path $Root "curriculum-report.json"

$LessonFiles = Get-ChildItem -Path $Root -Recurse -Filter *.ps1 -ErrorAction SilentlyContinue

$Index = @()

foreach ($file in $LessonFiles) {

    # Extract domain (folder name)
    $Domain = Split-Path $file.DirectoryName -Leaf

    # Extract lesson number
    if ($file.Name -match "Lesson-(\d+)\.ps1") {
        $LessonNumber = $Matches[1]
    } else {
        $LessonNumber = "Custom"
    }

    # Determine status
    $Status = if ($file.Length -lt 300) { "Placeholder" } else { "Complete" }

    $Entry = [PSCustomObject]@{
        Domain      = $Domain
        LessonID    = $LessonNumber
        FileName    = $file.Name
        FullPath    = $file.FullName
        SizeBytes   = $file.Length
        LastUpdated = $file.LastWriteTime
        Status      = $Status
    }

    $Index += $Entry
}

# Save report
$Index | ConvertTo-Json -Depth 5 | Set-Content -Path $Output -Encoding UTF8

Write-Host "Curriculum scan complete."
Write-Host "Report saved to:"
Write-Host $Output
