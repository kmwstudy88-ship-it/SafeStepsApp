param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Rewrite Engine ===" -ForegroundColor Cyan

$out = "C:\SafeSteps\rewrites"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
    $text = $json.content | Out-String

    $short = $text.Substring(0, [Math]::Min(300, $text.Length))

    $rewrite = [PSCustomObject]@{
        id      = $json.id
        summary = $short
    }

    $rewrite | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "Rewrites generated: $out" -ForegroundColor Green
