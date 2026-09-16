# ============================================================
#  SafeSteps Caseworker Summary Generator (Final Clean Version)
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($folder in $topicFolders) {

    $courseFile = Join-Path $folder.FullName "course.json"

    if (-not (Test-Path $courseFile)) {
        Write-Host "Skipping (no course.json): $($folder.Name)"
        continue
    }

    # Load JSON safely
    try {
        $raw = Get-Content $courseFile -Raw
        $course = $raw | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Host "❌ ERROR: Invalid JSON in $courseFile"
        Write-Host "   → Fix this file manually before running again."
        continue
    }

    # Validate JSON type
    if ($course -eq $null) {
        Write-Host "❌ ERROR: $courseFile loaded as NULL"
        continue
    }

    if ($course.GetType().Name -ne "PSCustomObject") {
        Write-Host "❌ ERROR: $courseFile loaded as type $($course.GetType().Name)"
        Write-Host "   → Expected PSCustomObject. This file is malformed."
        continue
    }

    # Convert folder name to readable topic name
    $topicName = ($folder.Name -replace '-', ' ')

    Write-Host "Adding caseworker summary for: $topicName"

    # Create topic-specific summary
    $summary = "This topic helps parents build practical skills related to $topicName. It supports safer, more consistent caregiving by improving understanding, strengthening emotional connection, and reducing stress in daily routines. This topic is suitable for parents who need guidance in applying positive parenting strategies and may benefit families working toward stability, reunification, or improved home safety."

    # Force-replace the property safely
    if ($course.PSObject.Properties.Match("caseworkerSummary")) {
        $course.PSObject.Properties.Remove("caseworkerSummary")
    }

    $course | Add-Member -MemberType NoteProperty -Name "caseworkerSummary" -Value $summary

    # Save updated JSON
    $json = $course | ConvertTo-Json -Depth 10
    Set-Content -Path $courseFile -Value $json -Encoding UTF8

    Write-Host "Updated caseworker summary for: $topicName"
}
