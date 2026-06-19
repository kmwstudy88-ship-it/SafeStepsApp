Write-Host "=== SAFE STEPS BULK RESET START ==="

$root = "C:\Users\SAFES\SafeStepsApp"

& (Join-Path $root "bulk-clean.ps1")
& (Join-Path $root "bulk-repair.ps1")

Write-Host "=== SAFE STEPS BULK RESET COMPLETE ==="
