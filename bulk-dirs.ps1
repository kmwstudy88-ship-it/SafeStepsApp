Write-Host "=== SAFE STEPS DIRECTORY CHECK ==="

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculum = Join-Path $root "safesteps-curriculum"

$dirs = @(
    $curriculum,
    (Join-Path $curriculum "weeks"),
    (Join-Path $curriculum "lessons"),
    (Join-Path $curriculum "snapshots"),
    (Join-Path $curriculum "integrated")
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
        Write-Host "Created: $d"
    } else {
        Write-Host "Exists: $d"
    }
}

Write-Host "=== DIRECTORY CHECK COMPLETE ==="
