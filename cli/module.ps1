param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    [string]$Id
)

$root = "C:\Users\SAFES\SafeStepsApp"
$modulesPath = Join-Path $root "safesteps-curriculum\modules.json"
$modules = Get-Content $modulesPath -Raw | ConvertFrom-Json

switch ($Action) {
    "list" {
        $modules.modules | Select-Object id, name | Format-Table
    }
    "show" {
        $m = $modules.modules | Where-Object { $_.id -eq $Id }
        if ($m) { $m | Format-List }
        else { Write-Host "Module $Id not found." }
    }
    default {
        Write-Host "Unknown module command: $Action"
    }
}
