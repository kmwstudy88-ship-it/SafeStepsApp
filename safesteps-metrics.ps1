param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Metrics Engine ===" -ForegroundColor Cyan

$metrics = [ordered]@{
    totals = @{
        programs = (Get-ChildItem "$CurriculumPath\programs" -Filter *.json).Count
        stages   = (Get-ChildItem "$CurriculumPath\stages" -Filter *.json).Count
        weeks    = (Get-ChildItem "$CurriculumPath\weeks" -Filter *.json).Count
        lessons  = (Get-ChildItem "$CurriculumPath\lessons" -Filter *.json).Count
    }
    averages = @{}
    lessonStats = @()
}

# Compute averages
$weeks = Get-ChildItem "$CurriculumPath\weeks" -Filter *.json
$lessonCounts = @()

foreach ($w in $weeks) {
    try {
        $json = Get-Content $w.FullName -Raw | ConvertFrom-Json
        $lessonCounts += $json.lessons.Count
    } catch {}
}

if ($lessonCounts.Count -gt 0) {
    $metrics.averages.lessonsPerWeek = [math]::Round(($lessonCounts | Measure-Object -Average).Average, 2)
}

# Lesson complexity
$lessons = Get-ChildItem "$CurriculumPath\lessons" -Filter *.json

foreach ($l in $lessons) {
    try {
        $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
        $text = ($json.content | Out-String)
        $words = ($text -split "\s+").Count
        $metrics.lessonStats += [PSCustomObject]@{
            id        = $json.id
            wordCount = $words
        }
    } catch {}
}

$path = Join-Path $CurriculumPath "metrics-report.json"
$metrics | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Metrics report written to $path" -ForegroundColor Green
