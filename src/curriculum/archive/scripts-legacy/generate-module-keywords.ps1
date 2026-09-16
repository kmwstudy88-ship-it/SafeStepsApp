# ============================================================
#  SafeSteps Module-Level Search Keyword Generator
# ============================================================

$basePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.0.0"

function Extract-ModuleKeywords($text) {

    $keywords = @()

    if ($text -match "stress|overwhelm|calm") { $keywords += "stress" ; $keywords += "calming strategies" }
    if ($text -match "emotion|feeling|regulation") { $keywords += "emotional regulation" }
    if ($text -match "routine|structure") { $keywords += "routines" ; $keywords += "structure" }
    if ($text -match "communication|talk|listen") { $keywords += "communication" }
    if ($text -match "connection|attachment|bond") { $keywords += "connection" ; $keywords += "attachment" }
    if ($text -match "discipline|behaviour|behavior") { $keywords += "positive discipline" }
    if ($text -match "safety|harm|danger") { $keywords += "safety" }
    if ($text -match "boundaries") { $keywords += "boundaries" }
    if ($text -match "confidence|self-esteem") { $keywords += "confidence" }
    if ($text -match "problem|challenge|solution") { $keywords += "problem solving" }

    if ($text -match "family") { $keywords += "family" }
    if ($text -match "parent") { $keywords += "parenting skills" }
    if ($text -match "child") { $keywords += "child development" }

    return $keywords | Select-Object -Unique
}

$topicFolders = Get-ChildItem -Path $basePath -Directory

foreach ($topic in $topicFolders) {

    $modulesPath = Join-Path $topic.FullName "modules"
    if (-not (Test-Path $modulesPath)) { continue }

    $moduleFolders = Get-ChildItem -Path $modulesPath -Directory

    foreach ($module in $moduleFolders) {

        $moduleFile = Join-Path $module.FullName "module.json"
        if (-not (Test-Path $moduleFile)) { continue }

        try {
            $moduleJson = Get-Content $moduleFile -Raw | ConvertFrom-Json -ErrorAction Stop
        }
        catch { continue }

        # Gather all lesson text
        $lessonsPath = Join-Path $module.FullName "lessons"
        $combinedText = $moduleJson.title

        if (Test-Path $lessonsPath) {

            $lessonFolders = Get-ChildItem -Path $lessonsPath -Directory

            foreach ($lesson in $lessonFolders) {

                $lessonFile = Join-Path $lesson.FullName "lesson.json"
                if (-not (Test-Path $lessonFile)) { continue }

                try {
                    $lessonJson = Get-Content $lessonFile -Raw | ConvertFrom-Json -ErrorAction Stop
                }
                catch { continue }

                $combinedText += " " + $lessonJson.title
                $combinedText += " " + ($lessonJson.keywords -join " ")
                $combinedText += " " + ($lessonJson.riskFlags -join " ")
                $combinedText += " " + ($lessonJson.safetyIndicators -join " ")
            }
        }

        # Extract keywords
        $keywords = Extract-ModuleKeywords $combinedText

        if ($moduleJson.PSObject.Properties.Match("keywords")) {
            $moduleJson.PSObject.Properties.Remove("keywords")
        }

        $moduleJson | Add-Member -MemberType NoteProperty -Name "keywords" -Value $keywords

        # Save
        $jsonOut = $moduleJson | ConvertTo-Json -Depth 20
        Set-Content -Path $moduleFile -Value $jsonOut -Encoding UTF8

        Write-Host "Added module keywords: $($moduleJson.title)"
    }
}

Write-Host "✅ Module-level search keywords added to all modules."
