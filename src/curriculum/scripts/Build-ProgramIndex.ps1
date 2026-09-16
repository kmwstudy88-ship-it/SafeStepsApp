# =====================================================================
# SAFE STEPS — PROGRAM INDEX BUILDER
# Creates: program-index.json
# =====================================================================

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

$OutputPath = Join-Path $ProgramsPath "program-index.json"

Write-Host "`n=== BUILDING PROGRAM INDEX ===`n"

# ---------------------------------------------------------------------
# HELPER: SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (Test-Path $Path) {
        try {
            return Get-Content $Path -Raw | ConvertFrom-Json
        }
        catch {
            Write-Host "[WARN] Failed to parse JSON: $Path" -ForegroundColor Yellow
            return $null
        }
    }
    return $null
}

# ---------------------------------------------------------------------
# INDEX STRUCTURE
# ---------------------------------------------------------------------

$Index = [ordered]@{
    generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    reunification_24m = @()
    home_again_12m    = @()
}

# ---------------------------------------------------------------------
# REUNIFICATION — STAGES + WEEKS
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $StageJson = Load-JsonSafe (Join-Path $Stage.FullName "stage.json")

    $StageEntry = [ordered]@{
        id     = $StageSlug
        slug   = $StageSlug
        title  = $StageJson.title
        focus  = $StageJson.description
        weeks  = @()
    }

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
    }

    $Index.reunification_24m += $StageEntry
    Write-Host "[STAGE] $StageSlug indexed"
}

# ---------------------------------------------------------------------
# HOME AGAIN — PHASES
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

    $Index.home_again_12m += $PhaseEntry
    Write-Host "[PHASE] $PhaseSlug indexed"
}

# ---------------------------------------------------------------------
# SAVE OUTPUT
# ---------------------------------------------------------------------

$Index | ConvertTo-Json -Depth 20 | Out-File $OutputPath -Encoding utf8

Write-Host "`n=== COMPLETE: program-index.json generated ===`n"
Write-Host "Location: $OutputPath"
