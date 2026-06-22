param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Difficulty Balancer ===" -ForegroundColor Cyan

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json
$report = @()

foreach ($l in $lessons) {
    try {
        $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
        $text = $json.content | Out-String
        $words = ($text -split "\s+").Count

        $difficulty = if ($words -gt 400) { "high" } elseif ($words -gt 150) { "medium" } else { "low" }

        if ($json.difficulty -ne $difficulty) {
            $report += [PSCustomObject]@{
                id         = $json.id
                old        = $json.difficulty
                suggested  = $difficulty
            }
        }
    } catch {}
}

$path = Join-Path $Root "difficulty-balance.json"
$report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Difficulty balance report: $path" -ForegroundColor Green
