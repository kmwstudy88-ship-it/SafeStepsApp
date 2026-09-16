# =====================================================================
# SAFE STEPS — SEARCH ENGINE v3 (NO WEEK.JSON DEPENDENCY)
# Full-text search across all content files only
# =====================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Query
)

$Root          = Get-Location
$ProgramsPath  = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — SEARCH ENGINE v3 ==="
Write-Host "Query: $Query`n"

# ---------------------------------------------------------------------
# SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return @() }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        return @()
    }
}

# ---------------------------------------------------------------------
# RESULT STRUCTURE
# ---------------------------------------------------------------------

$Results = @()

function Add-Result {
    param(
        [string]$Program,
        [string]$Stage,
        [string]$Week,
        [string]$Field,
        [string]$Value
    )

    $Results += [pscustomobject]@{
        program = $Program
        stage   = $Stage
        week    = $Week
        field   = $Field
        match   = $Value
    }
}

# ---------------------------------------------------------------------
# SEARCH REUNIFICATION PROGRAM
# ---------------------------------------------------------------------

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name

        # Content files ONLY
        $ContentFiles = @{
            tasks      = Join-Path $Week.FullName "tasks.json"
            milestones = Join-Path $Week.FullName "milestones.json"
            evidence   = Join-Path $Week.FullName "evidence.json"
            daily      = Join-Path $Week.FullName "daily-tasks.json"
        }

        foreach ($Field in $ContentFiles.Keys) {

            $Json = Load-JsonSafe $ContentFiles[$Field]

            foreach ($Item in $Json) {
                if ($Item -match $Query) {
                    Add-Result "reunification-24m" $StageSlug $WeekSlug $Field $Item
                }
            }
        }
    }
}

# ---------------------------------------------------------------------
# SEARCH HOME AGAIN PROGRAM
# ---------------------------------------------------------------------

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name

    $ContentFiles = @{
        tasks      = Join-Path $Phase.FullName "tasks.json"
        milestones = Join-Path $Phase.FullName "milestones.json"
        evidence   = Join-Path $Phase.FullName "evidence.json"
        daily      = Join-Path $Phase.FullName "daily-tasks.json"
    }

    foreach ($Field in $ContentFiles.Keys) {

        $Json = Load-JsonSafe $ContentFiles[$Field]

        foreach ($Item in $Json) {
            if ($Item -match $Query) {
                Add-Result "home-again-12m" $PhaseSlug "" $Field $Item
            }
        }
    }
}

# ---------------------------------------------------------------------
# OUTPUT RESULTS
# ---------------------------------------------------------------------

if ($Results.Count -eq 0) {
    Write-Host "No matches found.`n"
    exit
}

Write-Host "Matches found: $($Results.Count)`n"
$Results | Format-Table -AutoSize

$ResultsPath = Join-Path $ProgramsPath "search-results.json"
$Results | ConvertTo-Json -Depth 10 | Out-File $ResultsPath -Encoding utf8

Write-Host "`nResults saved to: $ResultsPath`n"
