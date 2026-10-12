param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Accessibility Engine ===" -ForegroundColor Cyan

$report = [ordered]@{
    longParagraphs = @()
    missingAltText = @()
    readingLevel   = @()
}

$lessons = Get-ChildItem "$Root\lessons" -Filter *.json

foreach ($l in $lessons) {
    $json = Get-Content $l.FullName -Raw | ConvertFrom-Json
    $text = $json.content | Out-String

    if ($text.Length -gt 1200) {
        $report.longParagraphs += $json.id
    }

    if ($json.images) {
        foreach ($img in $json.images) {
            if (-not $img.alt) {
                $report.missingAltText += "$($json.id) → $($img.src)"
            }
        }
    }

    $words = ($text -split "\s+").Count
    $sentences = ($text -split "[.!?]").Count
    if ($sentences -gt 0) {
        $grade = 0.39 * ($words / $sentences) + 11.8 * (($text.Length / 5) / $words) - 15.59
        $report.readingLevel += [PSCustomObject]@{
            id    = $json.id
            grade = [math]::Round($grade,2)
        }
    }
}

$path = Join-Path $Root "accessibility-report.json"
$report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Accessibility report: $path" -ForegroundColor Green
