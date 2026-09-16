# ============================================================
#  SafeSteps Lesson Caseworker Summary Generator
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($topic in $topicFolders) {

    $modulesPath = Join-Path $topic.FullName "modules"
    if (-not (Test-Path $modulesPath)) { continue }

    $moduleFolders = Get-ChildItem -Path $modulesPath -Directory

    foreach ($module in $moduleFolders) {

        $lessonsPath = Join-Path $module.FullName "lessons"
        if (-not (Test-Path $lessonsPath)) { continue }

        $lessonFolders = Get-ChildItem -Path $lessonsPath -Directory

        foreach ($lesson in $lessonFolders) {

            $lessonFile = Join-Path $lesson.FullName "lesson.json"
            if (-not (Test-Path $lessonFile)) {
                Write-Host "Skipping lesson (no lesson.json): $($lesson.Name)"
                continue
            }

            # Load JSON safely
            try {
                $lessonJson = Get-Content $lessonFile -Raw | ConvertFrom-Json -ErrorAction Stop
            }
            catch {
                Write-Host "❌ ERROR: Invalid JSON in $lessonFile"
                continue
            }

            # Build summary from lesson title
            $lessonName = $lessonJson.title
            $summary = "This lesson helps parents build practical skills related to $lessonName. It supports safer, more consistent caregiving by improving understanding, strengthening emotional connection, and reducing stress in daily routines. This lesson is suitable for parents who need guidance applying positive parenting strategies and may benefit families working toward stability, reunification, or improved home safety."

            # Remove old property if it exists
            if ($lessonJson.PSObject.Properties.Match("caseworkerSummary")) {
                $lessonJson.PSObject.Properties.Remove("caseworkerSummary")
            }

            # Add new summary
            $lessonJson | Add-Member -MemberType NoteProperty -Name "caseworkerSummary" -Value $summary

            # Save updated JSON
            $json = $lessonJson | ConvertTo-Json -Depth 20
            Set-Content -Path $lessonFile -Value $json -Encoding UTF8

            Write-Host "Updated lesson summary: $lessonName"
        }
    }
}

Write-Host "✅ Lesson caseworker summaries added to all lessons."
