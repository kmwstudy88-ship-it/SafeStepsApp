param([int]$Week)

$root = "C:\Users\SAFES\SafeStepsApp"
$weeks = Join-Path $root "safesteps-curriculum\weeks"
$lessons = Join-Path $root "safesteps-curriculum\lessons"

$weekFile = Join-Path $weeks ("Week-{0:D2}.json" -f $Week)

if (-not (Test-Path $weekFile)) {
    Write-Host "Week $Week not found."
    exit
}

$w = Get-Content $weekFile -Raw | ConvertFrom-Json

$lesson = [PSCustomObject]@{
    week = $Week
    stage = $w.stageName
    modules = $w.modules.name
    summary = "Lesson auto-generated for week $Week."
}

$out = Join-Path $lessons ("Lesson-{0:D2}.json" -f $Week)
$lesson | ConvertTo-Json -Depth 10 | Set-Content $out -Encoding UTF8

Write-Host "Lesson generated: $out"
