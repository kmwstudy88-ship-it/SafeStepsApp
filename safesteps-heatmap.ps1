param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Heatmap Engine ===" -ForegroundColor Cyan

$heatmap = [ordered]@{
    highComplexity = @()
    lowContent     = @()
    recentlyEdited = @()
}

$lessons = Get-ChildItem "$CurriculumPath\lessons" -Filter *.json

foreach ($l in $lessons) {
    try {
        $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
        $text = ($json.content | Out-String)
        $words = ($text -split "\s+").Count

        if ($words -gt 500) {
            $heatmap.highComplexity += $json.id
        }

        if ($words -lt 50) {
            $heatmap.lowContent += $json.id
        }

        if ($l.LastWriteTime -gt (Get-Date).AddDays(-7)) {
            $heatmap.recentlyEdited += $json.id
        }
    } catch {}
}

$path = Join-Path $CurriculumPath "heatmap.json"
$heatmap | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Heatmap written to $path" -ForegroundColor Green
