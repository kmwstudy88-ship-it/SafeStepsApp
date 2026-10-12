Write-Host 'Packaging SafeSteps release...'

 = Get-Date -Format 'yyyyMMdd-HHmmss'
 = \"release-\"

New-Item -ItemType Directory -Path 

Copy-Item backend -Recurse /backend
Copy-Item app -Recurse /app
Copy-Item caseworker-dashboard -Recurse /dashboard
Copy-Item forensic -Recurse /forensic

Write-Host \"Release created: \"
