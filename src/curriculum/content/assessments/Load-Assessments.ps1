# Loads all assessments listed in assessment-index.json

$indexPath = Join-Path $PSScriptRoot "assessment-index.json"

if (-not (Test-Path $indexPath)) {
    throw "Assessment index file not found: $indexPath"
}

$index = Get-Content $indexPath | ConvertFrom-Json

$assessments = @{}

foreach ($entry in $index.assessments) {
    $filePath = Join-Path $PSScriptRoot $entry.file

    if (-not (Test-Path $filePath)) {
        Write-Warning "Assessment file missing: $filePath"
        continue
    }

    $json = Get-Content $filePath | ConvertFrom-Json -Depth 20
    $assessments[$entry.id] = $json
}

return $assessments
