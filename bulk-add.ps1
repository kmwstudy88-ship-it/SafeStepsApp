powershell -ExecutionPolicy Bypass -File "app\log.ps1" -Message "Bulk-add started"
powershell -ExecutionPolicy Bypass -File "app\validate-safesteps.ps1"

Write-Host ""
Write-Host "Repairing JSON..."
powershell -ExecutionPolicy Bypass -File "app\repair-json.ps1"

Write-Host ""
Write-Host "Generating metadata..."
powershell -ExecutionPolicy Bypass -File "app\generate-metadata.ps1"

Write-Host ""
Write-Host "Normalizing folder names..."
powershell -ExecutionPolicy Bypass -File "app\normalize-folders.ps1"

Write-Host ""
Write-Host "Rebuilding SafeSteps library..."
powershell -ExecutionPolicy Bypass -File "build-safesteps-library.ps1"

powershell -ExecutionPolicy Bypass -File "app\log.ps1" -Message "Bulk-add completed"
