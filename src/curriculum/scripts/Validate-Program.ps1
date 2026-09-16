# =====================================================================
# SAFE STEPS — CURRICULUM ENGINE VALIDATOR
# Validates: 24m Reunification + 6–12m Home Again
# =====================================================================

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — VALIDATION REPORT ===`n"

# ---------------------------------------------------------------------
# HELPER: SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return @{ error = "missing" }
    }

    $Raw = Get-Content $Path -Raw

    if ([string]::IsNullOrWhiteSpace($Raw)) {
        return @{ error = "empty" }
    }

    try {
        return $Raw | ConvertFrom-Json
    }
    catch {
        return @{ error = "invalid" }
    }
}

# ---------------------------------------------------------------------
# VALIDATION BUCKETS
# ---------------------------------------------------------------------

$Report = [ordered]@{
    missing_files      = @()
    empty_files        = @()
    invalid_json       = @()
    missing_tasks      = @()
    missing_milestones = @()
    missing_evidence   = @()
    missing_daily      = @()
    missing_stage_meta = @()
    missing_phase_meta = @()
}

# ---------------------------------------------------------------------
# VALIDATE REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $StageJsonPath = Join-Path $Stage.FullName "stage.json"
    $StageJson = Load-JsonSafe $StageJsonPath

    if ($StageJson.error) {
        $Report.missing_stage_meta += $StageSlug
    }

    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name

        $Paths = @{
            tasks      = Join-Path $Week.FullName "tasks.json"
            milestones = Join-Path $Week.FullName "milestones.json"
            evidence   = Join-Path $Week.FullName "evidence.json"
            daily      = Join-Path $Week.FullName "daily-tasks.json"
        }

        foreach ($Key in $Paths.Keys) {

            $FilePath = $Paths[$Key]
            $Json     = Load-JsonSafe $FilePath

            switch ($Json.error) {
                "missing" { $Report.missing_files += $FilePath }
                "empty"   { $Report.empty_files   += $FilePath }
                "invalid" { $Report.invalid_json  += $FilePath }
            }

            if (-not $Json.error -and $Json.Count -eq 0) {
                switch ($Key) {
                    "tasks"      { $Report.missing_tasks      += "$StageSlug/$WeekSlug" }
                    "milestones" { $Report.missing_milestones += "$StageSlug/$WeekSlug" }
                    "evidence"   { $Report.missing_evidence   += "$StageSlug/$WeekSlug" }
                    "daily"      { $Report.missing_daily      += "$StageSlug/$WeekSlug" }
                }
            }
        }
    }
}

# ---------------------------------------------------------------------
# VALIDATE HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    $PhaseJsonPath = Join-Path $Phase.FullName "phase.json"
    $PhaseJson = Load-JsonSafe $PhaseJsonPath

    if ($PhaseJson.error) {
        $Report.missing_phase_meta += $PhaseSlug
    }

    $Paths = @{
        tasks      = Join-Path $Phase.FullName "tasks.json"
        milestones = Join-Path $Phase.FullName "milestones.json"
        evidence   = Join-Path $Phase.FullName "evidence.json"
        daily      = Join-Path $Phase.FullName "daily-tasks.json"
    }

    foreach ($Key in $Paths.Keys) {

        $FilePath = $Paths[$Key]
        $Json     = Load-JsonSafe $FilePath

        switch ($Json.error) {
            "missing" { $Report.missing_files += $FilePath }
            "empty"   { $Report.empty_files   += $FilePath }
            "invalid" { $Report.invalid_json  += $FilePath }
        }

        if (-not $Json.error -and $Json.Count -eq 0) {
            switch ($Key) {
                "tasks"      { $Report.missing_tasks      += $PhaseSlug }
                "milestones" { $Report.missing_milestones += $PhaseSlug }
                "evidence"   { $Report.missing_evidence   += $PhaseSlug }
                "daily"      { $Report.missing_daily      += $PhaseSlug }
            }
        }
    }
}

# ---------------------------------------------------------------------
# OUTPUT REPORT
# ---------------------------------------------------------------------

$ReportPath = Join-Path $ProgramsPath "validation-report.json"
$Report | ConvertTo-Json -Depth 10 | Out-File $ReportPath -Encoding utf8

Write-Host "`n=== VALIDATION COMPLETE ==="
Write-Host "Report saved to: $ReportPath`n"
