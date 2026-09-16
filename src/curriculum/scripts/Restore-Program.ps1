# =====================================================================
# SAFE STEPS — RESTORE ENGINE
# Restores a snapshot into the programs directory
# =====================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Name
)

$Root        = Get-Location
$Programs    = Join-Path $Root "programs"
$Snapshots   = Join-Path $Root "snapshots"

# Find matching snapshot folder
$Match = Get-ChildItem $Snapshots | Where-Object { $_.Name -like "$Name*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $Match) {
    Write-Host "ERROR: No snapshot found matching '$Name'"
    exit
}

$SnapshotPath = $Match.FullName

Write-Host "`n=== RESTORING SNAPSHOT ==="
Write-Host "From: $SnapshotPath"
Write-Host "To:   $Programs`n"

# Remove current program folder
if (Test-Path $Programs) {
    Remove-Item $Programs -Recurse -Force
}

# Restore snapshot
Copy-Item -Path $SnapshotPath\programs -Destination $Programs -Recurse -Force

Write-Host "Restore complete.`n"
