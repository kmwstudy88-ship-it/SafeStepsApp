Write-Host "=== SAFE STEPS FULL PIPELINE START ==="

$root = "C:\Users\SAFES\SafeStepsApp"

& (Join-Path $root "bulk-repair.ps1")
& (Join-Path $root "bulk-build.ps1")

Write-Host "=== SAFE STEPS FULL PIPELINE COMPLETE ==="
