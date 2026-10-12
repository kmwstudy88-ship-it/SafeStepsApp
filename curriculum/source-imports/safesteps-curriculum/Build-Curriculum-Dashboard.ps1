# ============================================
# SafeSteps Curriculum Dashboard Generator
# ============================================

$Root = "C:\Users\SAFES\safesteps\safesteps-curriculum"
$IndexOutput = Join-Path $Root "master-lessons-index.json"
$DashboardOutput = Join-Path $Root "curriculum-dashboard.json"

# Get all lesson scripts
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

    # Build entry
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

# Save master index
$Index | ConvertTo-Json -Depth 5 | Set-Content -Path $IndexOutput -Encoding UTF8

# ============================================
# Build Dashboard Summary
# ============================================

$Dashboard = @()

$Domains = $Index | Select-Object -ExpandProperty Domain -Unique

foreach ($domain in $Domains) {

    $DomainLessons = $Index | Where-Object { $_.Domain -eq $domain }

    $Total = $DomainLessons.Count
    $Complete = ($DomainLessons | Where-Object { $_.Status -eq "Complete" }).Count
    $Placeholder = $Total - $Complete

    $Percent = if ($Total -gt 0) {
        [math]::Round(($Complete / $Total) * 100, 2)
    } else {
        0
    }

    $DashboardEntry = [PSCustomObject]@{
        Domain          = $domain
        TotalLessons    = $Total
        Completed       = $Complete
        Placeholders    = $Placeholder
        CompletionRate  = "$Percent%"
    }

    $Dashboard += $DashboardEntry
}

# Save dashboard
$Dashboard | ConvertTo-Json -Depth 5 | Set-Content -Path $DashboardOutput -Encoding UTF8

Write-Host "Curriculum dashboard created:"
Write-Host $DashboardOutput
