Write-Host "Building SafeSteps curriculum taxonomy..."

$root = "C:\Users\SAFES\SafeStepsApp"
$taxonomyPath = Join-Path $root "safesteps-curriculum\taxonomy.json"

# Create taxonomy template if missing
if (-not (Test-Path $taxonomyPath)) {
    Write-Host "taxonomy.json not found. Creating template..."
    @"
{
  "domains": [],
  "skills": [],
  "tags": []
}
"@ | Out-File $taxonomyPath -Encoding UTF8
}

Write-Host "Curriculum taxonomy build complete."
