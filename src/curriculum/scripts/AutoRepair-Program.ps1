# =====================================================================
# SAFE STEPS — AUTO‑REPAIR ENGINE
# Automatically fixes structural and content issues in the curriculum
# =====================================================================

$Root          = Get-Location
$ProgramsPath  = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — AUTO‑REPAIR ENGINE ===`n"

$Fixes = @()
$Errors = @()

# ---------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------

function Ensure-Folder {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        $Fixes += "Created missing folder: $Path"
    }
}

function Write-Json {
    param([string]$Path, $Content)

    $Content | ConvertTo-Json -Depth 10 | Out-File $Path -Encoding utf8
}

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return $null }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        $Errors += "Invalid JSON: $Path"
        return "INVALID"
    }
}

function Ensure-JsonFile {
    param(
        [string]$Path,
        $Default
    )

    if (-not (Test-Path $Path)) {
        Write-Json -Path $Path -Content $Default
        $Fixes += "Created missing JSON file: $Path"
        return $Default
    }

    $Json = Load-JsonSafe $Path

    if ($Json -eq "INVALID") {
        Write-Json -Path $Path -Content $Default
        $Fixes += "Repaired invalid JSON: $Path"
        return $Default
    }

    return $Json
}

# ---------------------------------------------------------------------
# FIX REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

Write-Host "Repairing 24‑month program..."

Ensure-Folder $Reunification

for ($s = 1; $s -le 12; $s++) {

    $StageSlug = "stage-{0:D2}" -f $s
    $StagePath = Join-Path $Reunification $StageSlug

    Ensure-Folder $StagePath

    # Stage metadata
    $StageJsonPath = Join-Path $StagePath "stage.json"
    $StageJson = Ensure-JsonFile -Path $StageJsonPath -Default @{
        id          = $StageSlug
        slug        = $StageSlug
        title       = ""
        description = ""
    }

    # Fix slug mismatch
    if ($StageJson.slug -ne $StageSlug) {
        $StageJson.slug = $StageSlug
        Write-Json -Path $StageJsonPath -Content $StageJson
        $Fixes += "Fixed stage slug: $StageSlug"
    }

    # Weeks
    for ($w = 1; $w -le 8; $w++) {

        $WeekSlug = "week-{0:D2}" -f $w
        $WeekPath = Join-Path $StagePath $WeekSlug

        Ensure-Folder $WeekPath

        # Week metadata
        $WeekJsonPath = Join-Path $WeekPath "week.json"
        $WeekJson = Ensure-JsonFile -Path $WeekJsonPath -Default @{
            id    = $WeekSlug
            slug  = $WeekSlug
            title = ""
            focus = ""
        }

        # Fix slug mismatch
        if ($WeekJson.slug -ne $WeekSlug) {
            $WeekJson.slug = $WeekSlug
            Write-Json -Path $WeekJsonPath -Content $WeekJson
            $Fixes += "Fixed week slug: $StageSlug / $WeekSlug"
        }

        # Content files
        Ensure-JsonFile -Path (Join-Path $WeekPath "tasks.json")      -Default @()
        Ensure-JsonFile -Path (Join-Path $WeekPath "milestones.json") -Default @()
        Ensure-JsonFile -Path (Join-Path $WeekPath "evidence.json")   -Default @()
        Ensure-JsonFile -Path (Join-Path $WeekPath "daily-tasks.json")-Default @()
    }
}

# ---------------------------------------------------------------------
# FIX HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

Write-Host "Repairing Home Again program..."

Ensure-Folder $HomeAgain

for ($p = 1; $p -le 3; $p++) {

    $PhaseSlug = "phase-{0:D2}" -f $p
    $PhasePath = Join-Path $HomeAgain $PhaseSlug

    Ensure-Folder $PhasePath

    # Phase metadata
    $PhaseJsonPath = Join-Path $PhasePath "phase.json"
    $PhaseJson = Ensure-JsonFile -Path $PhaseJsonPath -Default @{
        id          = $PhaseSlug
        slug        = $PhaseSlug
        title       = ""
        description = ""
    }

    if ($PhaseJson.slug -ne $PhaseSlug) {
        $PhaseJson.slug = $PhaseSlug
        Write-Json -Path $PhaseJsonPath -Content $PhaseJson
        $Fixes += "Fixed phase slug: $PhaseSlug"
    }

    # Content files
    Ensure-JsonFile -Path (Join-Path $PhasePath "tasks.json")      -Default @()
    Ensure-JsonFile -Path (Join-Path $PhasePath "milestones.json") -Default @()
    Ensure-JsonFile -Path (Join-Path $PhasePath "evidence.json")   -Default @()
    Ensure-JsonFile -Path (Join-Path $PhasePath "daily-tasks.json")-Default @()
}

# ---------------------------------------------------------------------
# OUTPUT RESULTS
# ---------------------------------------------------------------------

Write-Host "`n=== AUTO‑REPAIR RESULTS ===`n"

if ($Fixes.Count -gt 0) {
    Write-Host "🔧 FIXES APPLIED:"
    $Fixes | ForEach-Object { Write-Host " - $_" }
    Write-Host ""
}

if ($Errors.Count -gt 0) {
    Write-Host "❌ ERRORS FOUND:"
    $Errors | ForEach-Object { Write-Host " - $_" }
    Write-Host ""
}

if ($Fixes.Count -eq 0 -and $Errors.Count -eq 0) {
    Write-Host "✅ No issues found. Curriculum is fully healthy."
}

Write-Host ""
