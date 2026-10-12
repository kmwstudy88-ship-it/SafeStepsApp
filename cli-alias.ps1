$root = "C:\Users\SAFES\SafeStepsApp"

Set-Alias ss (Join-Path $root "ss.ps1")
Set-Alias ss-build  (Join-Path $root "cli\build.ps1")
Set-Alias ss-clean  (Join-Path $root "cli\clean.ps1")
Set-Alias ss-repair (Join-Path $root "cli\repair.ps1")
Set-Alias ss-status (Join-Path $root "cli\status.ps1")
