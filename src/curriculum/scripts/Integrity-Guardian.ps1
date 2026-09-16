# =====================================================================
# SAFE STEPS — CURRICULUM INTEGRITY GUARDIAN
# Deep structural validation of the entire curriculum
# =====================================================================

$Root          = Get-Location
$ProgramsPath  = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — INTEGRITY GUARDIAN ===`n"

$Errors   = @()
$Warnings = @()
$Info     = @()

# ---------------------------------------------------------------------
# SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return $null
    }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        return "INVALID_JSON"
    }
}

# ---------------------------------------------------------------------
# CHECK FILE EXISTS
# ---------------------------------------------------------------------

function Check-File {
    param(
        [string]$Path,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        $Errors += "$Label missing: $Path"
        return $null
    }

    $Json = Load-JsonSafe $Path

    if ($Json -eq "INVALID_JSON") {
        $Errors += "$Label invalid JSON: $Path"
        return $null
    }

    return $Json
}

# ---------------------------------------------------------------------
# CHECK REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

Write-Host "Checking 24‑month program..."

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $StageJsonPath = Join-Path $Stage.FullName "stage.json"

    $StageJson = Check-File -Path $StageJsonPath -Label "Stage metadata"

    if ($StageJson -eq $null) { continue }

    # Validate stage slug
    if ($StageJson.slug -ne $StageSlug) {
        $Warnings += "Stage slug mismatch in $StageSlug"
    }

    # Check weeks
    $Weeks = Get-ChildItem $Stage.FullName -Directory

    if ($Weeks.Count -eq 0) {
        $Errors += "Stage $StageSlug has no weeks"
        continue
    }

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name
        $WeekJsonPath = Join-Path $Week.FullName "week.json"

        $WeekJson = Check-File -Path $WeekJsonPath -Label "Week metadata"

        if ($WeekJson -eq $null) { continue }

        # Validate week slug
        if ($WeekJson.slug -ne $WeekSlug) {
            $Warnings += "Week slug mismatch in $StageSlug / $WeekSlug"
        }

        # Check content files
        $ContentFiles = @{
            tasks      = Join-Path $Week.FullName "tasks.json"
            milestones = Join-Path $Week.FullName "milestones.json"
            evidence   = Join-Path $Week.FullName "evidence.json"
            daily      = Join-Path $Week.FullName "daily-tasks.json"
        }

        foreach ($Key in $ContentFiles.Keys) {

            $Json = Check-File -Path $ContentFiles[$Key] -Label "$Key file"

            if ($Json -eq $null) { continue }

            if ($Json.Count -eq 0) {
                $Warnings += "$StageSlug / $WeekSlug has empty $Key"
            }
        }
    }
}

# ---------------------------------------------------------------------
# CHECK HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

Write-Host "Checking Home Again program..."

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    $PhaseJsonPath = Join-Path $Phase.FullName "phase.json"

    $PhaseJson = Check-File -Path $PhaseJsonPath -Label "Phase metadata"

    if ($PhaseJson -eq $null) { continue }

    if ($PhaseJson.slug -ne $PhaseSlug) {
        $Warnings += "Phase slug mismatch in $PhaseSlug"
    }

    $ContentFiles = @{
        tasks      = Join-Path $Phase.FullName "tasks.json"
        milestones = Join-Path $Phase.FullName "milestones.json"
        evidence   = Join-Path $Phase.FullName "evidence.json"
        daily      = Join-Path $Phase.FullName "daily-tasks.json"
    }

    foreach ($Key in $ContentFiles.Keys) {

        $Json = Check-File -Path $ContentFiles[$Key] -Label "$Key file"

        if ($Json -eq $null) { continue }

        if ($Json.Count -eq 0) {
            $Warnings += "$PhaseSlug has empty $Key"
        }
    }
}

# ---------------------------------------------------------------------
# OUTPUT RESULTS
# ---------------------------------------------------------------------

Write-Host "`n=== RESULTS ===`n"

if ($Errors.Count -gt 0) {
    Write-Host "❌ ERRORS:"
    $Errors | ForEach-Object { Write-Host " - $_" }
    Write-Host ""
}

if ($Warnings.Count -gt 0) {
    Write-Host "⚠️ WARNINGS:"
    $Warnings | ForEach-Object { Write-Host " - $_" }
    Write-Host ""
}

if ($Errors.Count -eq 0 -and $Warnings.Count -eq 0) {
    Write-Host "✅ All checks passed. Curriculum integrity is healthy."
}
else {
    Write-Host "Review errors and warnings above."
}

Write-Host ""
