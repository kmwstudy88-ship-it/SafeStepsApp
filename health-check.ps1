Write-Host 'Running SafeSteps health checks...'

Write-Host 'Checking backend API...'
Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing

Write-Host 'Checking dashboard...'
Invoke-WebRequest -Uri 'http://localhost:3001' -UseBasicParsing

Write-Host 'Checking RN packager...'
Invoke-WebRequest -Uri 'http://localhost:19000' -UseBasicParsing

Write-Host 'Checking database file...'
Test-Path backend/db/dev.db

Write-Host 'Checking forensic engine...'
Invoke-WebRequest -Uri 'http://localhost:3000/forensic/chan-001' -UseBasicParsing

Write-Host 'Checking moderation engine...'
Invoke-WebRequest -Uri 'http://localhost:3000/messages' -Method POST -Body '{""}' -ContentType 'application/json'

Write-Host 'Health check complete.'
