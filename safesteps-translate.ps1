param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum",
    [string]$Lang = "es"
)

Write-Host "=== SafeSteps Translation Engine ===" -ForegroundColor Cyan

$out = "C:\SafeSteps\translations\$Lang"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
    $export = [PSCustomObject]@{
        id      = $json.id
        title   = $json.title
        content = $json.content
    }
    $export | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "Translation export ready: $out" -ForegroundColor Green
