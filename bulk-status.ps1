Write-Host "=== SAFE STEPS STATUS ==="

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculum = Join-Path $root "safesteps-curriculum"

$files = @(
    "modules.json",
    "program-definition.json",
    "taxonomy.json",
    "evidence-index.json",
    "daily-tasks.json",
    "combined-curriculum.json",
    "integrated-program.json"
)

foreach ($f in $files) {
    $p = Join-Path $curriculum $f
    if (Test-Path $p) { Write-Host "[OK] $f" }
    else { Write-Host "[MISSING] $f" }
}

$dirs = @("weeks","lessons","snapshots","integrated")

foreach ($d in $dirs) {
    $p = Join-Path $curriculum $d
    if (Test-Path $p) { Write-Host "[DIR OK] $d" }
    else { Write-Host "[DIR MISSING] $d" }
}

Write-Host "=== STATUS COMPLETE ==="
