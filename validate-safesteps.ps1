Write-Host "Validating SafeSteps curriculum..."

$root = "C:\Users\SAFES\SafeStepsApp"
$index = Join-Path $root "safesteps-curriculum\master-index.json"

if (-not (Test-Path $index)) {
    Write-Host "WARNING: master-index.json not found at $index" -ForegroundColor Yellow
    return
}

try {
    $json = Get-Content $index -Raw | ConvertFrom-Json
    Write-Host "Master index JSON is valid."
}
catch {
    Write-Host "ERROR: master-index.json contains invalid JSON." -ForegroundColor Red
    return
}

Write-Host "Curriculum validation complete."
