# =====================================================================
# SAFE STEPS — CURRICULUM EDITOR API SIMULATOR
# Allows editing of tasks, milestones, evidence, daily routines, titles, focus
# =====================================================================

param(
    [string]$Stage,
    [string]$Week,
    [string]$Phase,

    [string]$AddTask,
    [string]$RemoveTask,
    [string[]]$SetTasks,

    [string]$AddMilestone,
    [string]$RemoveMilestone,
    [string[]]$SetMilestones,

    [string]$AddEvidence,
    [string]$RemoveEvidence,
    [string[]]$SetEvidence,

    [string]$AddDaily,
    [string]$RemoveDaily,
    [string[]]$SetDaily,

    [string]$SetTitle,
    [string]$SetFocus
)

$Root         = Get-Location
$ProgramsPath = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"

Write-Host "`n=== SAFE STEPS — EDITOR API ===`n"

# ---------------------------------------------------------------------
# VALIDATION
# ---------------------------------------------------------------------

if (-not $Stage -and -not $Phase) {
    Write-Host "ERROR: You must specify either -Stage or -Phase"
    exit
}

if ($Stage -and -not $Week) {
    Write-Host "ERROR: Editing a stage requires -Week"
    exit
}

# ---------------------------------------------------------------------
# SAFE JSON LOADER / WRITER
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

function Write-JsonSafe {
    param([string]$Path, $Content)

    $Content | ConvertTo-Json -Depth 10 | Out-File $Path -Encoding utf8
}

# ---------------------------------------------------------------------
# TARGET PATH RESOLUTION
# ---------------------------------------------------------------------

if ($Stage) {
    $TargetPath = Join-Path (Join-Path $Reunification ("stage-$Stage")) ("week-$Week")
    $Program = "reunification-24m"
    $StageSlug = "stage-$Stage"
    $WeekSlug  = "week-$Week"
}
else {
    $TargetPath = Join-Path $HomeAgain ("phase-$Phase")
    $Program = "home-again-12m"
    $StageSlug = "phase-$Phase"
    $WeekSlug  = ""
}

Write-Host "Editing: $Program / $StageSlug $WeekSlug"
Write-Host "Path: $TargetPath`n"

# ---------------------------------------------------------------------
# FILE PATHS
# ---------------------------------------------------------------------

$Paths = @{
    tasks      = Join-Path $TargetPath "tasks.json"
    milestones = Join-Path $TargetPath "milestones.json"
    evidence   = Join-Path $TargetPath "evidence.json"
    daily      = Join-Path $TargetPath "daily-tasks.json"
    weekmeta   = Join-Path $TargetPath "week.json"
    phasemeta  = Join-Path $TargetPath "phase.json"
}

# ---------------------------------------------------------------------
# LOAD CONTENT
# ---------------------------------------------------------------------

$Tasks      = Load-JsonSafe $Paths.tasks
$Milestones = Load-JsonSafe $Paths.milestones
$Evidence   = Load-JsonSafe $Paths.evidence
$Daily      = Load-JsonSafe $Paths.daily

if ($Stage) {
    $Meta = Load-JsonSafe $Paths.weekmeta
}
else {
    $Meta = Load-JsonSafe $Paths.phasemeta
}

# ---------------------------------------------------------------------
# APPLY EDITS
# ---------------------------------------------------------------------

# --- TASKS ---
if ($AddTask) {
    $Tasks += $AddTask
    Write-Host "[OK] Added task: $AddTask"
}

if ($RemoveTask) {
    $Tasks = $Tasks | Where-Object { $_ -ne $RemoveTask }
    Write-Host "[OK] Removed task: $RemoveTask"
}

if ($SetTasks) {
    $Tasks = $SetTasks
    Write-Host "[OK] Replaced all tasks"
}

# --- MILESTONES ---
if ($AddMilestone) {
    $Milestones += $AddMilestone
    Write-Host "[OK] Added milestone: $AddMilestone"
}

if ($RemoveMilestone) {
    $Milestones = $Milestones | Where-Object { $_ -ne $RemoveMilestone }
    Write-Host "[OK] Removed milestone: $RemoveMilestone"
}

if ($SetMilestones) {
    $Milestones = $SetMilestones
    Write-Host "[OK] Replaced all milestones"
}

# --- EVIDENCE ---
if ($AddEvidence) {
    $Evidence += $AddEvidence
    Write-Host "[OK] Added evidence: $AddEvidence"
}

if ($RemoveEvidence) {
    $Evidence = $Evidence | Where-Object { $_ -ne $RemoveEvidence }
    Write-Host "[OK] Removed evidence: $RemoveEvidence"
}

if ($SetEvidence) {
    $Evidence = $SetEvidence
    Write-Host "[OK] Replaced all evidence"
}

# --- DAILY ---
if ($AddDaily) {
    $Daily += $AddDaily
    Write-Host "[OK] Added daily task: $AddDaily"
}

if ($RemoveDaily) {
    $Daily = $Daily | Where-Object { $_ -ne $RemoveDaily }
    Write-Host "[OK] Removed daily task: $RemoveDaily"
}

if ($SetDaily) {
    $Daily = $SetDaily
    Write-Host "[OK] Replaced all daily tasks"
}

# --- METADATA ---
if ($SetTitle) {
    $Meta.title = $SetTitle
    Write-Host "[OK] Updated title"
}

if ($SetFocus) {
    $Meta.focus = $SetFocus
    Write-Host "[OK] Updated focus"
}

# ---------------------------------------------------------------------
# SAVE CHANGES
# ---------------------------------------------------------------------

Write-JsonSafe -Path $Paths.tasks      -Content $Tasks
Write-JsonSafe -Path $Paths.milestones -Content $Milestones
Write-JsonSafe -Path $Paths.evidence   -Content $Evidence
Write-JsonSafe -Path $Paths.daily      -Content $Daily

if ($Stage) {
    Write-JsonSafe -Path $Paths.weekmeta -Content $Meta
}
else {
    Write-JsonSafe -Path $Paths.phasemeta -Content $Meta
}

Write-Host "`n=== EDIT COMPLETE ===`n"
