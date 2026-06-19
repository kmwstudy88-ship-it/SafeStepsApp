param(
    [Parameter(Mandatory=$true)]
    [string]$Id,
    [string]$AddTask,
    [string]$AddEvidence
)

$root = "C:\Users\SAFES\SafeStepsApp"
$modulesPath = Join-Path $root "safesteps-curriculum\modules.json"

$modules = Get-Content $modulesPath -Raw | ConvertFrom-Json
$module = $modules.modules | Where-Object { $_.id -eq $Id }

if (-not $module) {
    Write-Host "Module $Id not found."
    exit
}

if ($AddTask) { $module.tasks += $AddTask }
if ($AddEvidence) { $module.evidence += $AddEvidence }

$modules | ConvertTo-Json -Depth 10 | Set-Content $modulesPath -Encoding UTF8

Write-Host "Module $Id updated."
