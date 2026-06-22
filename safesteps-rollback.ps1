param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host "=== SafeSteps Rollback Engine ===" -ForegroundColor Cyan
Write-Host "Restoring version: $Version" -ForegroundColor Yellow

# -----------------------------------------
# ABSOLUTE PATHS (NO MORE $paths.Root)
# -----------------------------------------
$curriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
$versionRoot    = "C:\SafeSteps\versions"
$backupRoot     = "C:\SafeSteps\backups"

$versionPath = Join-Path $versionRoot $Version

if (-not (Test-Path $versionPath)) {
    Write-Host "Version $Version does not exist." -ForegroundColor Red
    exit
}

# -----------------------------------------
# BACKUP CURRENT CURRICULUM
# -----------------------------------------
if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

$timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$backupPath = Join-Path $backupRoot "backup-$timestamp"

Copy-Item -Recurse -Path $curriculumPath -Destination $backupPath -Force

Write-Host "Backup created at: $backupPath" -ForegroundColor Green

# -----------------------------------------
# DELETE CURRENT CURRICULUM
# -----------------------------------------
Remove-Item -Recurse -Force -Path $curriculumPath

# -----------------------------------------
# RESTORE SELECTED VERSION
# -----------------------------------------
Copy-Item -Recurse -Path "$versionPath\curriculum" -Destination $curriculumPath -Force

Write-Host "Curriculum restored from version $Version" -ForegroundColor Green

# -----------------------------------------
# VALIDATE RESTORED CURRICULUM
# -----------------------------------------
$validateScript = Join-Path $PSScriptRoot "safesteps-validate.ps1"
& $validateScript

Write-Host "=== Rollback Complete ===" -ForegroundColor Cyan
