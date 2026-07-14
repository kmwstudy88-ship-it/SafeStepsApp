param([string] \)

Write-Host \"Restoring SafeSteps from cloud backup: \\"

Copy-Item \ backend/db/dev.db -Force

Write-Host 'Disaster recovery complete.'
