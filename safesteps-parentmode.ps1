param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Parent Mode Engine ===" -ForegroundColor Cyan

$out = "C:\SafeSteps\parent-mode"
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
    $text = $json.content | Out-String

    $parent = "Parent Summary: " + $text.Substring(0, [Math]::Min(150, $text.Length))

    $obj = [PSCustomObject]@{
        id      = $json.id
        parentSummary = $parent
    }

    $obj | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $out "$($json.id).json")
}

Write-Host "Parent mode summaries created: $out" -ForegroundColor Green
