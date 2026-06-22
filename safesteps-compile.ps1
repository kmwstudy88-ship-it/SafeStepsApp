param()

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Starting Curriculum Compiler" -Level "INFO"

function Load-Files($folder) {
    Get-ChildItem -Path $folder -Filter *.json -ErrorAction SilentlyContinue |
        ForEach-Object {
            try {
                $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
                return @{ id = $json.id; data = $json; file = $_.FullName }
            }
            catch {
                Write-Host "❌ Invalid JSON: $($_.FullName)" -ForegroundColor Red
            }
        }
}

# Load all curriculum
$programs = Load-Files $paths.Programs
$stages   = Load-Files $paths.Stages
$weeks    = Load-Files $paths.Weeks
$lessons  = Load-Files $paths.Lessons

# Index
$index = @{
    programs = @{}
    stages   = @{}
    weeks    = @{}
    lessons  = @{}
}

foreach ($p in $programs) { $index.programs[$p.id] = $p }
foreach ($s in $stages)   { $index.stages[$s.id]   = $s }
foreach ($w in $weeks)    { $index.weeks[$w.id]    = $w }
foreach ($l in $lessons)  { $index.lessons[$l.id]  = $l }

Write-Host "=== SafeSteps Curriculum Compiler ===" -ForegroundColor Cyan

# Cross-link validation
$errors = @()

foreach ($s in $stages) {
    if (-not $index.programs.ContainsKey($s.data.programId)) {
        $errors += "Stage '$($s.id)' references missing program '$($s.data.programId)'"
    }
}

foreach ($w in $weeks) {
    if (-not $index.stages.ContainsKey($w.data.stageId)) {
        $errors += "Week '$($w.id)' references missing stage '$($w.data.stageId)'"
    }
}

foreach ($l in $lessons) {
    if (-not $index.weeks.ContainsKey($l.data.weekId)) {
        $errors += "Lesson '$($l.id)' references missing week '$($l.data.weekId)'"
    }
}

# Schema validation
function Check-Fields($obj, $required, $label) {
    foreach ($field in $required) {
        if (-not $obj.PSObject.Properties.Name.Contains($field)) {
            return "$label '$($obj.id)' missing required field '$field'"
        }
    }
    return $null
}

foreach ($p in $programs) {
    $msg = Check-Fields $p.data @("id","name","stages") "Program"
    if ($msg) { $errors += $msg }
}

foreach ($s in $stages) {
    $msg = Check-Fields $s.data @("id","name","programId","weeks") "Stage"
    if ($msg) { $errors += $msg }
}

foreach ($w in $weeks) {
    $msg = Check-Fields $w.data @("id","name","stageId","lessons") "Week"
    if ($msg) { $errors += $msg }
}

foreach ($l in $lessons) {
    $msg = Check-Fields $l.data @("id","title","weekId","content") "Lesson"
    if ($msg) { $errors += $msg }
}

# Report
if ($errors.Count -eq 0) {
    Write-Host "✔ Compiler completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Compiler found $($errors.Count) issues:" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host " - $e" -ForegroundColor Yellow
    }
}

Write-SafeStepsLog -Message "Compiler completed with $($errors.Count) issues" -Level "INFO"
