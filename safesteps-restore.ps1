param(
    [string]$BackupPath,
    [string]$Target="C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Restore Engine ===" -ForegroundColor Cyan

if(-not(Test-Path $BackupPath)){
    Write-Host "Backup not found." -ForegroundColor Red
    exit
}

Remove-Item -Recurse -Force $Target
Copy-Item -Recurse -Force -Path $BackupPath -Destination $Target

Write-Host "Curriculum restored from $BackupPath" -ForegroundColor Green
