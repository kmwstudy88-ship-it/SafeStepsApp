# =====================================================================
# SAFE STEPS — PROGRAM STRUCTURE GENERATOR (REWRITE)
# Creates: stages, weeks, stage.json, week.json, phases, phase.json
# =====================================================================

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"

$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== GENERATING PROGRAM STRUCTURE ===`n"

# ---------------------------------------------------------------------
# HELPER: ENSURE FOLDER EXISTS
# ---------------------------------------------------------------------

function Ensure-Folder {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

# ---------------------------------------------------------------------
# HELPER: WRITE JSON
# ---------------------------------------------------------------------

function Write-Json {
    param(
        [string]$Path,
        $Content
    )

    $Content | ConvertTo-Json -Depth 10 | Out-File $Path -Encoding utf8
}

# ---------------------------------------------------------------------
# CREATE ROOT PROGRAM FOLDERS
# ---------------------------------------------------------------------

Ensure-Folder $ProgramsPath
Ensure-Folder $Reunification
Ensure-Folder $HomeAgain

# ---------------------------------------------------------------------
# CREATE 24-MONTH PROGRAM STRUCTURE
# ---------------------------------------------------------------------

for ($s = 1; $s -le 12; $s++) {

    $StageSlug = "stage-{0:D2}" -f $s
    $StagePath = Join-Path $Reunification $StageSlug

    Ensure-Folder $StagePath

    # Create stage.json
    $StageJson = @{
        id          = $StageSlug
        slug        = $StageSlug
        title       = ""
        description = ""
    }

    Write-Json -Path (Join-Path $StagePath "stage.json") -Content $StageJson

    # Create 8 weeks per stage
    for ($w = 1; $w -le 8; $w++) {

        $WeekSlug = "week-{0:D2}" -f $w
        $WeekPath = Join-Path $StagePath $WeekSlug

        Ensure-Folder $WeekPath

        # Create week.json
        $WeekJson = @{
            id    = $WeekSlug
            slug  = $WeekSlug
            title = ""
            focus = ""
        }

        Write-Json -Path (Join-Path $WeekPath "week.json") -Content $WeekJson

        # Create empty content files
        Write-Json -Path (Join-Path $WeekPath "tasks.json")      -Content @()
        Write-Json -Path (Join-Path $WeekPath "milestones.json") -Content @()
        Write-Json -Path (Join-Path $WeekPath "evidence.json")   -Content @()
        Write-Json -Path (Join-Path $WeekPath "daily-tasks.json")-Content @()
    }

    Write-Host "[STAGE CREATED] $StageSlug"
}

# ---------------------------------------------------------------------
# CREATE HOME AGAIN PROGRAM STRUCTURE
# ---------------------------------------------------------------------

for ($p = 1; $p -le 3; $p++) {

    $PhaseSlug = "phase-{0:D2}" -f $p
    $PhasePath = Join-Path $HomeAgain $PhaseSlug

    Ensure-Folder $PhasePath

    # Create phase.json
    $PhaseJson = @{
        id          = $PhaseSlug
        slug        = $PhaseSlug
        title       = ""
        description = ""
    }

    Write-Json -Path (Join-Path $PhasePath "phase.json") -Content $PhaseJson

    # Create empty content files
    Write-Json -Path (Join-Path $PhasePath "tasks.json")      -Content @()
    Write-Json -Path (Join-Path $PhasePath "milestones.json") -Content @()
    Write-Json -Path (Join-Path $PhasePath "evidence.json")   -Content @()
    Write-Json -Path (Join-Path $PhasePath "daily-tasks.json")-Content @()

    Write-Host "[PHASE CREATED] $PhaseSlug"
}

Write-Host "`n=== PROGRAM STRUCTURE COMPLETE ===`n"
