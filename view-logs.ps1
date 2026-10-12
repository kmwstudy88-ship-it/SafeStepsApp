Write-Host 'Viewing all SafeSteps logs...'

Start-Process powershell -ArgumentList '-Command Get-Content backend/server.log -Wait'
Start-Process powershell -ArgumentList '-Command Get-Content backend/db/dev.db -Wait'
Start-Process powershell -ArgumentList '-Command Get-Content backend/logs/* -Wait'
