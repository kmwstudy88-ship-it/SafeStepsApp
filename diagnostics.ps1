Write-Host 'SafeSteps Diagnostics'

Write-Host 'Node version:'
node -v

Write-Host 'NPM version:'
npm -v

Write-Host 'Running processes:'
Get-Process | Select-Object Name, Id

Write-Host 'Open ports:'
Get-NetTCPConnection | Select-Object LocalPort, OwningProcess

Write-Host 'Backend routes:'
Get-Content backend/routes/messages.js
Get-Content backend/routes/channels.js
Get-Content backend/routes/forensic.js

Write-Host 'Dashboard structure:'
Get-ChildItem caseworker-dashboard/src/pages -Recurse
