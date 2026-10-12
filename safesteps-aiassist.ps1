param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps AI-Assist Engine ===" -ForegroundColor Cyan

$assist = @()

$lessons = Get-ChildItem "$CurriculumPath\lessons" -Filter *.json

foreach ($l in $lessons) {
    try {
        $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
        $text = ($json.content | Out-String)

        $words = ($text -split "\s+").Count

        $assist += [PSCustomObject]@{
            id          = $json.id
            summary     = $text.Substring(0, [Math]::Min(200, $text.Length))
            keywords    = ($text -split "\s+" | Select-Object -First 10)
            difficulty  = if ($words -gt 400) { "high" } elseif ($words -gt 150) { "medium" } else { "low" }
            objectives  = $json.objectives
        }
    } catch {}
}

$path = Join-Path $CurriculumPath "ai-assist.json"
$assist | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "AI-assist metadata written to $path" -ForegroundColor Green
