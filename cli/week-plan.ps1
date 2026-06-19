param([int]$Week)

$root = "C:\Users\SAFES\SafeStepsApp"
$weeks = Join-Path $root "safesteps-curriculum\weeks"

$file = Join-Path $weeks ("Week-{0:D2}.json" -f $Week)

if (-not (Test-Path $file)) {
    Write-Host "Week $Week not found."
    exit
}

$w = Get-Content $file -Raw | ConvertFrom-Json

Write-Host "Week $Week — $($w.stageName)"
Write-Host "Modules:"
$w.modules | Select-Object name | Format-Table

Write-Host "Tasks:"
foreach ($m in $w.modules) {
    foreach ($t in $m.tasks) { Write-Host " - $t" }
}
