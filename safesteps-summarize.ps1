param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Summarization Engine ===" -ForegroundColor Cyan

$out = Join-Path $Root "summaries"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
    $text = $json.content | Out-String

    $summary = $text.Substring(0, [Math]::Min(200, $text.Length))

    $obj = [PSCustomObject]@{
        id      = $json.id
        summary = $summary
    }

    $obj | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "Summaries created: $out" -ForegroundColor Green
