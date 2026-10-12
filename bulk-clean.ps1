Write-Host "=== SAFE STEPS BULK CLEAN START ==="

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculum = Join-Path $root "safesteps-curriculum"

$paths = @(
    (Join-Path $curriculum "weeks"),
    (Join-Path $curriculum "lessons"),
    (Join-Path $curriculum "snapshots"),
    (Join-Path $curriculum "integrated"),
    (Join-Path $curriculum "combined-curriculum.json"),
    (Join-Path $curriculum "integrated-program.json"),
    (Join-Path $curriculum "taxonomy.json"),
    (Join-Path $curriculum "evidence-index.json"),
    (Join-Path $curriculum "daily-tasks.json")
)

foreach ($p in $paths) {
    if (Test-Path $p) { Remove-Item -Recurse -Force $p }
}

Write-Host "=== SAFE STEPS BULK CLEAN COMPLETE ==="
