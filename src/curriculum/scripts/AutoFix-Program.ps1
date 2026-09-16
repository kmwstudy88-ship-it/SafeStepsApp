# =====================================================================
# SAFE STEPS — AUTO-FIXER (MODE C)
# Repairs: Missing files, empty JSON, invalid JSON, missing content
# =====================================================================

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — AUTO-FIXER STARTED ===`n"

# ---------------------------------------------------------------------
# DEFAULT CONTENT (used when files are missing or empty)
# ---------------------------------------------------------------------

$Defaults = @{
    tasks      = @("Task placeholder — auto-generated")
    milestones = @("Milestone placeholder — auto-generated")
    evidence   = @("Evidence placeholder — auto-generated")
    daily      = @("Daily task placeholder — auto-generated")
}

# ---------------------------------------------------------------------
# SAFE JSON LOADER
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
# SAFE JSON WRITER
# ---------------------------------------------------------------------

function Write-JsonSafe {
    param(
        [string]$Path,
        $Content
    )

    $Content | ConvertTo-Json -Depth 10 | Out-File $Path -Encoding utf8
}

# ---------------------------------------------------------------------
# FIX WEEK CONTENT
# ---------------------------------------------------------------------

function Fix-WeekContent {
    param(
        [string]$WeekPath
    )

    $Files = @{
        tasks      = Join-Path $WeekPath "tasks.json"
        milestones = Join-Path $WeekPath "milestones.json"
        evidence   = Join-Path $WeekPath "evidence.json"
        daily      = Join-Path $WeekPath "daily-tasks.json"
    }

    foreach ($Key in $Files.Keys) {

        $Path = $Files[$Key]
        $Json = Load-JsonSafe $Path

        switch ($Json.error) {

            "missing" {
                Write-Host "   [FIX] Missing $Key.json — creating default"
                Write-JsonSafe -Path $Path -Content $Defaults[$Key]
            }

            "empty" {
                Write-Host "   [FIX] Empty $Key.json — restoring default"
                Write-JsonSafe -Path $Path -Content $Defaults[$Key]
            }

            "invalid" {
                Write-Host "   [FIX] Invalid $Key.json — overwriting with default"
                Write-JsonSafe -Path $Path -Content $Defaults[$Key]
            }

            default {
                if ($Json.Count -eq 0) {
                    Write-Host "   [FIX] $Key.json had no items — restoring default"
                    Write-JsonSafe -Path $Path -Content $Defaults[$Key]
                }
            }
        }
    }
}

# ---------------------------------------------------------------------
# FIX STAGE METADATA
# ---------------------------------------------------------------------

function Fix-StageMeta {
    param(
        [string]$StagePath,
        [string]$StageSlug
    )

    $MetaPath = Join-Path $StagePath "stage.json"
    $Json = Load-JsonSafe $MetaPath

    if ($Json.error) {
        Write-Host "[FIX] Rebuilding missing/invalid stage.json for $StageSlug"

        $Content = @{
            id    = $StageSlug
            slug  = $StageSlug
            title = ""
            description = ""
            weeks = @()
        }

        Write-JsonSafe -Path $MetaPath -Content $Content
    }
}

# ---------------------------------------------------------------------
# FIX PHASE METADATA
# ---------------------------------------------------------------------

function Fix-PhaseMeta {
    param(
        [string]$PhasePath,
        [string]$PhaseSlug
    )

    $MetaPath = Join-Path $PhasePath "phase.json"
    $Json = Load-JsonSafe $MetaPath

    if ($Json.error) {
        Write-Host "[FIX] Rebuilding missing/invalid phase.json for $PhaseSlug"

        $Content = @{
            id    = $PhaseSlug
            slug  = $PhaseSlug
            title = ""
            description = ""
            weeks = @()
        }

        Write-JsonSafe -Path $MetaPath -Content $Content
    }
}

# ---------------------------------------------------------------------
# PROCESS REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    Write-Host "`n[STAGE] Checking $StageSlug"

    Fix-StageMeta -StagePath $Stage.FullName -StageSlug $StageSlug

    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name
        Write-Host "   [WEEK] Checking $WeekSlug"

        Fix-WeekContent -WeekPath $Week.FullName
    }
}

# ---------------------------------------------------------------------
# PROCESS HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    Write-Host "`n[PHASE] Checking $PhaseSlug"

    Fix-PhaseMeta -PhasePath $Phase.FullName -PhaseSlug $PhaseSlug

    Fix-WeekContent -WeekPath $Phase.FullName
}

# ---------------------------------------------------------------------
# DONE
# ---------------------------------------------------------------------

Write-Host "`n=== AUTO-FIX COMPLETE — Your curriculum engine is now healthy ===`n"
