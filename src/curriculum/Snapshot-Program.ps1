Write-Host "Creating SafeSteps program snapshot..."

$root = "C:\Users\SAFES\SafeStepsApp"
$curriculumRoot = Join-Path $root "safesteps-curriculum"

$integratedPath = Join-Path $curriculumRoot "integrated-program.json"
$snapshotFolder = Join-Path $curriculumRoot "snapshots"

New-Item -ItemType Directory -Force -Path $snapshotFolder | Out-Null

if (-not (Test-Path $integratedPath)) {
    Write-Host "integrated-program.json not found."
    return
}

$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$snapshotPath = Join-Path $snapshotFolder "snapshot_$timestamp.json"

Copy-Item -Path $integratedPath -Destination $snapshotPath -Force

Write-Host "Snapshot created: $snapshotPath"
