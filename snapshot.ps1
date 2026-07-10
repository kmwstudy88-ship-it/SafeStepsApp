Write-Host 'Creating SafeSteps environment snapshot...'

 = Get-Date -Format 'yyyyMMdd-HHmmss'
 = \"snapshot-\"

New-Item -ItemType Directory -Path 

Copy-Item backend/db/dev.db /dev.db
Copy-Item version.txt /version.txt
Copy-Item backend/logs /logs -Recurse

Write-Host \"Snapshot created: \"
