param(
    [string]$ModulesFolder = "modules",
    [string]$OutputFile = "curriculum_all_modules.json"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $root -Parent

$modulesPath = Join-Path $repoRoot $ModulesFolder
$outputPath  = Join-Path $repoRoot $OutputFile

$moduleFiles = Get-ChildItem -Path $modulesPath -Filter "module_*.json"

$modules = foreach ($file in $moduleFiles) {
    Get-Content $file.FullName -Raw | ConvertFrom-Json
}

$modules | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8

Write-Host "Merged modules written to $outputPath"
