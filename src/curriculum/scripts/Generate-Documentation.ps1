# =====================================================================
# SAFE STEPS — DOCUMENTATION GENERATOR
# Creates full human-readable curriculum documentation in Markdown
# =====================================================================

$Root          = Get-Location
$ProgramsPath  = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"
$Dist          = Join-Path $Root "dist"

if (-not (Test-Path $Dist)) {
    New-Item -ItemType Directory -Path $Dist | Out-Null
}

$OutputPath = Join-Path $Dist "curriculum-documentation.md"

Write-Host "`n=== SAFE STEPS — DOCUMENTATION GENERATOR ==="
Write-Host "Output: $OutputPath`n"

# ---------------------------------------------------------------------
# SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return $null }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

# ---------------------------------------------------------------------
# START DOCUMENT
# ---------------------------------------------------------------------

$Doc = @()
$Doc += "# SafeSteps Curriculum Documentation"
$Doc += ""
$Doc += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$Doc += ""
$Doc += "---"
$Doc += ""

# ---------------------------------------------------------------------
# 24-MONTH PROGRAM
# ---------------------------------------------------------------------

$Doc += "# Reunification Program (24 Months)"
$Doc += ""

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $StageJson = Load-JsonSafe (Join-Path $Stage.FullName "stage.json")

    $Doc += "## $StageSlug — $($StageJson.title)"
    $Doc += ""
    $Doc += "$($StageJson.description)"
    $Doc += ""

    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name
        $WeekJson = Load-JsonSafe (Join-Path $Week.FullName "week.json")

        $Doc += "### $StageSlug / $WeekSlug — $($WeekJson.title)"
        $Doc += ""
        $Doc += "**Focus:** $($WeekJson.focus)"
        $Doc += ""

        # Content files
        $Tasks      = Load-JsonSafe (Join-Path $Week.FullName "tasks.json")
        $Milestones = Load-JsonSafe (Join-Path $Week.FullName "milestones.json")
        $Evidence   = Load-JsonSafe (Join-Path $Week.FullName "evidence.json")
        $Daily      = Load-JsonSafe (Join-Path $Week.FullName "daily-tasks.json")

        # Tasks
        $Doc += "#### Tasks"
        if ($Tasks.Count -eq 0) { $Doc += "_No tasks defined._" }
        else { foreach ($T in $Tasks) { $Doc += "- $T" } }
        $Doc += ""

        # Milestones
        $Doc += "#### Milestones"
        if ($Milestones.Count -eq 0) { $Doc += "_No milestones defined._" }
        else { foreach ($M in $Milestones) { $Doc += "- $M" } }
        $Doc += ""

        # Evidence
        $Doc += "#### Evidence"
        if ($Evidence.Count -eq 0) { $Doc += "_No evidence defined._" }
        else { foreach ($E in $Evidence) { $Doc += "- $E" } }
        $Doc += ""

        # Daily Tasks
        $Doc += "#### Daily Tasks"
        if ($Daily.Count -eq 0) { $Doc += "_No daily tasks defined._" }
        else { foreach ($D in $Daily) { $Doc += "- $D" } }
        $Doc += ""
    }
}

# ---------------------------------------------------------------------
# HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

$Doc += "# Home Again Program (12 Months)"
$Doc += ""

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    $PhaseJson = Load-JsonSafe (Join-Path $Phase.FullName "phase.json")

    $Doc += "## $PhaseSlug — $($PhaseJson.title)"
    $Doc += ""
    $Doc += "$($PhaseJson.description)"
    $Doc += ""

    # Content files
    $Tasks      = Load-JsonSafe (Join-Path $Phase.FullName "tasks.json")
    $Milestones = Load-JsonSafe (Join-Path $Phase.FullName "milestones.json")
    $Evidence   = Load-JsonSafe (Join-Path $Phase.FullName "evidence.json")
    $Daily      = Load-JsonSafe (Join-Path $Phase.FullName "daily-tasks.json")

    # Tasks
    $Doc += "### Tasks"
    if ($Tasks.Count -eq 0) { $Doc += "_No tasks defined._" }
    else { foreach ($T in $Tasks) { $Doc += "- $T" } }
    $Doc += ""

    # Milestones
    $Doc += "### Milestones"
    if ($Milestones.Count -eq 0) { $Doc += "_No milestones defined._" }
    else { foreach ($M in $Milestones) { $Doc += "- $M" } }
    $Doc += ""

    # Evidence
    $Doc += "### Evidence"
    if ($Evidence.Count -eq 0) { $Doc += "_No evidence defined._" }
    else { foreach ($E in $Evidence) { $Doc += "- $E" } }
    $Doc += ""

    # Daily Tasks
    $Doc += "### Daily Tasks"
    if ($Daily.Count -eq 0) { $Doc += "_No daily tasks defined._" }
    else { foreach ($D in $Daily) { $Doc += "- $D" } }
    $Doc += ""
}

# ---------------------------------------------------------------------
# SAVE DOCUMENT
# ---------------------------------------------------------------------

$Doc -join "`n" | Out-File $OutputPath -Encoding utf8

Write-Host "Documentation generated successfully."
Write-Host "Location: $OutputPath`n"
