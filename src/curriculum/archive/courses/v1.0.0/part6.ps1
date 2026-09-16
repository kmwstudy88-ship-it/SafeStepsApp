# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 6 of 10 — Generate topics.json
# ================================================

Write-Host "=== PART 6: Generating topics.json ===" -ForegroundColor Cyan

$topicsOutput = @()

if ($Global:FinalTopics -and $Global:FinalTopics.Keys.Count -gt 0) {
    foreach ($topicSlug in $Global:FinalTopics.Keys) {
        $topicsOutput += $Global:FinalTopics[$topicSlug]
    }
}
else {
    Write-Host "WARN: No topics found to export." -ForegroundColor Yellow
}

$topicsPath = Join-Path $Global:BasePath "topics.json"

try {
    $topicsOutput |
        ConvertTo-Json -Depth 20 |
        Set-Content -Path $topicsPath -Encoding UTF8

    Write-Host "Created topics.json at: $topicsPath" -ForegroundColor Green
    $Global:ProcessingReport += "Generated topics.json with $($topicsOutput.Count) topics."
}
catch {
    Write-Host "ERROR: Failed to write topics.json" -ForegroundColor Red
    $Global:ProcessingReport += "ERROR: Failed to write topics.json"
}

Write-Host "PART 6 complete: topics.json exported." -ForegroundColor Green
