param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Progression Engine ===" -ForegroundColor Cyan

$progression = @()

$weeks = Get-ChildItem "$Root\weeks" -Filter *.json

foreach ($w in $weeks) {
    try {
        $json = Get-Content $w.FullName -Raw | ConvertFrom-Json
        $progression += [PSCustomObject]@{
            weekId   = $json.id
            lessons  = $json.lessons
            nextWeek = $json.nextWeek
        }
    } catch {}
}

$path = Join-Path $Root "progression-map.json"
$progression | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Progression map created: $path" -ForegroundColor Green
