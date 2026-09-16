# =====================================================================
# SAFE STEPS — PROGRAM EXPORTER
# Exports: JSON + CSV + Human-readable report
# =====================================================================

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

$ExportJson = Join-Path $ProgramsPath "program-export.json"
$ExportCsv  = Join-Path $ProgramsPath "program-export.csv"
$ExportTxt  = Join-Path $ProgramsPath "program-report.txt"

Write-Host "`n=== SAFE STEPS — PROGRAM EXPORTER STARTED ===`n"

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
# EXPORT STRUCTURES
# ---------------------------------------------------------------------

$Export = [ordered]@{
    generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    reunification_24m = @()
    home_again_12m    = @()
}

$CsvRows = @()
$TxtLines = @()

# ---------------------------------------------------------------------
# PROCESS REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $StageJson = Load-JsonSafe (Join-Path $Stage.FullName "stage.json")

    $StageEntry = [ordered]@{
        id    = $StageSlug
        slug  = $StageSlug
        title = $StageJson.title
        description = $StageJson.description
        weeks = @()
    }

    $TxtLines += "=== $StageSlug — $($StageJson.title) ==="
    $TxtLines += "$($StageJson.description)"
    $TxtLines += ""

    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name
        $WeekJson = Load-JsonSafe (Join-Path $Week.FullName "week.json")

        $Tasks      = Load-JsonSafe (Join-Path $Week.FullName "tasks.json")
        $Milestones = Load-JsonSafe (Join-Path $Week.FullName "milestones.json")
        $Evidence   = Load-JsonSafe (Join-Path $Week.FullName "evidence.json")
        $Daily      = Load-JsonSafe (Join-Path $Week.FullName "daily-tasks.json")

        $WeekEntry = [ordered]@{
            id         = $WeekSlug
            slug       = $WeekSlug
            title      = $WeekJson.title
            focus      = $WeekJson.focus
            tasks      = $Tasks
            milestones = $Milestones
            evidence   = $Evidence
            daily      = $Daily
        }

        $StageEntry.weeks += $WeekEntry

        # CSV row
        $CsvRows += [pscustomobject]@{
            program     = "reunification-24m"
            stage       = $StageSlug
            week        = $WeekSlug
            title       = $WeekJson.title
            focus       = $WeekJson.focus
            tasks       = ($Tasks -join "; ")
            milestones  = ($Milestones -join "; ")
            evidence    = ($Evidence -join "; ")
            daily       = ($Daily -join "; ")
        }

        # TXT report
        $TxtLines += "[$StageSlug / $WeekSlug]"
        $TxtLines += "Focus: $($WeekJson.focus)"
        $TxtLines += "Tasks:"
        $Tasks | ForEach-Object { $TxtLines += " - $_" }
        $TxtLines += "Milestones:"
        $Milestones | ForEach-Object { $TxtLines += " - $_" }
        $TxtLines += "Evidence:"
        $Evidence | ForEach-Object { $TxtLines += " - $_" }
        $TxtLines += "Daily:"
        $Daily | ForEach-Object { $TxtLines += " - $_" }
        $TxtLines += ""
    }

    $Export.reunification_24m += $StageEntry
}

# ---------------------------------------------------------------------
# PROCESS HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    $PhaseJson = Load-JsonSafe (Join-Path $Phase.FullName "phase.json")

    $Tasks      = Load-JsonSafe (Join-Path $Phase.FullName "tasks.json")
    $Milestones = Load-JsonSafe (Join-Path $Phase.FullName "milestones.json")
    $Evidence   = Load-JsonSafe (Join-Path $Phase.FullName "evidence.json")
    $Daily      = Load-JsonSafe (Join-Path $Phase.FullName "daily-tasks.json")

    $PhaseEntry = [ordered]@{
        id         = $PhaseSlug
        slug       = $PhaseSlug
        title      = $PhaseJson.title
        focus      = $PhaseJson.description
        tasks      = $Tasks
        milestones = $Milestones
        evidence   = $Evidence
        daily      = $Daily
    }

    $Export.home_again_12m += $PhaseEntry

    # CSV row
    $CsvRows += [pscustomobject]@{
        program     = "home-again-12m"
        stage       = $PhaseSlug
        week        = ""
        title       = $PhaseJson.title
        focus       = $PhaseJson.description
        tasks       = ($Tasks -join "; ")
        milestones  = ($Milestones -join "; ")
        evidence    = ($Evidence -join "; ")
        daily       = ($Daily -join "; ")
    }

    # TXT report
    $TxtLines += "=== $PhaseSlug — $($PhaseJson.title) ==="
    $TxtLines += "Focus: $($PhaseJson.description)"
    $TxtLines += "Tasks:"
    $Tasks | ForEach-Object { $TxtLines += " - $_" }
    $TxtLines += "Milestones:"
    $Milestones | ForEach-Object { $TxtLines += " - $_" }
    $TxtLines += "Evidence:"
    $Evidence | ForEach-Object { $TxtLines += " - $_" }
    $TxtLines += "Daily:"
    $Daily | ForEach-Object { $TxtLines += " - $_" }
    $TxtLines += ""
}

# ---------------------------------------------------------------------
# WRITE OUTPUT FILES
# ---------------------------------------------------------------------

$Export | ConvertTo-Json -Depth 20 | Out-File $ExportJson -Encoding utf8
$CsvRows | Export-Csv -Path $ExportCsv -NoTypeInformation -Encoding utf8
$TxtLines | Out-File $ExportTxt -Encoding utf8

Write-Host "`n=== EXPORT COMPLETE ==="
Write-Host "JSON: $ExportJson"
Write-Host "CSV:  $ExportCsv"
Write-Host "TXT:  $ExportTxt"
Write-Host ""
