Write-Host "Building base SafeSteps curriculum..."

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculumRoot = Join-Path $root "safesteps-curriculum"
$weeksFolder = Join-Path $curriculumRoot "weeks"
$lessonsFolder = Join-Path $curriculumRoot "lessons"
$indexPath = Join-Path $curriculumRoot "master-index.json"

# Ensure folders exist
foreach ($folder in @($curriculumRoot, $weeksFolder, $lessonsFolder)) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "Created missing folder: $folder"
    }
}

# Ensure master index exists
if (-not (Test-Path $indexPath)) {
    Write-Host "master-index.json not found. Creating template..."
    @"
{
  "programName": "SafeSteps Custom Program",
  "version": "1.0.0",
  "weeks": [],
  "lessons": [],
  "metadata": {
    "created": "",
    "updated": ""
  }
}
"@ | Out-File $indexPath -Encoding UTF8
}

Write-Host "Base curriculum build complete."
