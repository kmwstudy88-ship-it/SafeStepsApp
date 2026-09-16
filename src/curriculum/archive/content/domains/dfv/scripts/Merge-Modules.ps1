# scripts\Merge-Modules.ps1
param(
    [string]$ModulesFolder = "modules",
    [string]$OutputFile = "curriculum_all_modules.json"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $root -Parent

$modulesPath = Join-Path $repoRoot $ModulesFolder
$outputPath  = Join-Path $repoRoot $OutputFile

if (-not (Test-Path $modulesPath)) {
    Write-Error "Modules folder not found: $modulesPath"
    exit 1
}

$moduleFiles = Get-ChildItem -Path $modulesPath -Filter "*.json"

$allModules = @()

foreach ($file in $moduleFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        $allModules += $json
        Write-Host "Merged: $($file.Name)"
    }
    catch {
        Write-Warning "Skipping invalid JSON file: $($file.Name)"
    }
}

$allModules | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8

Write-Host "`nCreated merged curriculum file:"
Write-Host $outputPath
