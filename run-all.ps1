Write-Host 'Starting ALL SafeSteps services...'

Start-Process powershell -ArgumentList '-File backend/start.ps1'
Start-Process powershell -ArgumentList '-File caseworker-dashboard/start.ps1'
Start-Process powershell -ArgumentList '-File app/start.ps1'

Write-Host 'Launching database watcher...'
Start-Process powershell -ArgumentList '-Command Get-Content backend/db/dev.db -Wait'

Write-Host 'Tailing backend logs...'
Start-Process powershell -ArgumentList '-Command Get-Content backend/server.log -Wait'
