Write-Host "=== SAFE STEPS ALIAS SETUP ==="

$root = "C:\Users\SAFES\SafeStepsApp"

Set-Alias ss-build  (Join-Path $root "bulk-build.ps1")
Set-Alias ss-repair (Join-Path $root "bulk-repair.ps1")
Set-Alias ss-clean  (Join-Path $root "bulk-clean.ps1")
Set-Alias ss-reset  (Join-Path $root "bulk-reset.ps1")
Set-Alias ss-full   (Join-Path $root "bulk-full.ps1")
Set-Alias ss-status (Join-Path $root "bulk-status.ps1")

Write-Host "Aliases created."
