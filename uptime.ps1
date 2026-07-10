Write-Host 'Checking SafeSteps uptime...'

Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing
Invoke-WebRequest -Uri 'http://localhost:3001' -UseBasicParsing

Write-Host 'Uptime check complete.'
