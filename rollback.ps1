param([string] \)

if (-Not (Test-Path \)) {
    Write-Host 'ERROR: Snapshot not found.'
    exit 1
}

Write-Host \"Rolling back to snapshot: \\"

Copy-Item \"\/dev.db\" backend/db/dev.db -Force
Copy-Item \"\/version.txt\" version.txt -Force

Write-Host 'Rollback complete.'
