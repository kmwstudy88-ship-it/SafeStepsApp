# =====================================================================
# SAFE STEPS — SNAPSHOT ENGINE
# Creates a full backup of the entire programs directory
# =====================================================================

param(
    [string]$Name = "snapshot"
)

$Root        = Get-Location
$Programs    = Join-Path $Root "programs"
$Snapshots   = Join-Path $Root "snapshots"

# Ensure snapshot folder exists
if (-not (Test-Path $Snapshots)) {
    New-Item -ItemType Directory -Path $Snapshots | Out-Null
}

# Timestamped folder
$Timestamp = (Get-Date).ToString("yyyy-MM-dd-HH-mm-ss")
$SnapshotFolder = Join-Path $Snapshots "$Name-$Timestamp"

Write-Host "`n=== CREATING SNAPSHOT ==="
Write-Host "From: $Programs"
Write-Host "To:   $SnapshotFolder`n"

Copy-Item -Path $Programs -Destination $SnapshotFolder -Recurse -Force

Write-Host "Snapshot created successfully.`n"
Write-Host "Location: $SnapshotFolder`n"
