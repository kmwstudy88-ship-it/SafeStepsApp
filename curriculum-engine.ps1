powershell -ExecutionPolicy Bypass -File "app\log.ps1" -Message "Curriculum engine started"
powershell -ExecutionPolicy Bypass -File "app\validate-safesteps.ps1"

Write-Host ""
Write-Host "Repairing JSON..."
powershell -ExecutionPolicy Bypass -File "app\repair-json.ps1"

Write-Host "Rebuilding SafeSteps library..."
powershell -ExecutionPolicy Bypass -File "build-safesteps-library.ps1"

Write-Host "Generating metadata..."
powershell -ExecutionPolicy Bypass -File "app\generate-metadata.ps1"
powershell -ExecutionPolicy Bypass -File "app\log.ps1" -Message "Curriculum engine completed"
