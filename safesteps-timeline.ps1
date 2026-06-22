param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Timeline Engine ===" -ForegroundColor Cyan

$timeline = @()

$files = Get-ChildItem -Recurse $Root -Filter *.json

foreach ($f in $files) {
    try {
        $json = Get-Content $f.FullName -Raw | ConvertFrom-Json
        $timeline += [PSCustomObject]@{
            id        = $json.id
            type      = $json.type
            file      = $f.FullName
            modified  = $f.LastWriteTime
        }
    } catch {}
}

$timeline = $timeline | Sort-Object modified

$path = Join-Path $Root "timeline.json"
$timeline | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Timeline generated: $path" -ForegroundColor Green
