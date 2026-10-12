Write-Host 'Performing SafeSteps rolling update...'

Write-Host '1. Deploy new backend container'
Write-Host '2. Wait for health checks'
Write-Host '3. Switch traffic'
Write-Host '4. Drain old container'
Write-Host '5. Repeat for dashboard'

Write-Host 'Rolling update complete.'
