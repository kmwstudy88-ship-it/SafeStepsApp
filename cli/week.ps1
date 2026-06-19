param([int]$Week)

$root = "C:\Users\SAFES\SafeStepsApp"
$weeks = Join-Path $root "safesteps-curriculum\weeks"

$file = Join-Path $weeks ("Week-{0:D2}.json" -f $Week)

if (Test-Path $file) {
    Get-Content $file -Raw | ConvertFrom-Json | Format-List
} else {
    Write-Host "Week $Week not found."
}
