Write-Host "=== SAFE STEPS BULK REPAIR START ==="

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculum = Join-Path $root "safesteps-curriculum"

New-Item -ItemType Directory -Force -Path $curriculum | Out-Null

$folders = @(
    (Join-Path $curriculum "weeks"),
    (Join-Path $curriculum "lessons"),
    (Join-Path $curriculum "snapshots"),
    (Join-Path $curriculum "integrated")
)

foreach ($f in $folders) {
    if (Test-Path $f) { Remove-Item -Recurse -Force $f }
    New-Item -ItemType Directory -Force -Path $f | Out-Null
}

$files = @(
    "combined-curriculum.json",
    "integrated-program.json",
    "taxonomy.json",
    "evidence-index.json",
    "daily-tasks.json"
)

foreach ($file in $files) {
    $path = Join-Path $curriculum $file
    if (Test-Path $path) { Remove-Item -Force $path }
}

Write-Host "=== SAFE STEPS BULK REPAIR COMPLETE ==="
