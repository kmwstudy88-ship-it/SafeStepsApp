# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 8 of 10 — Generate processing-report.txt
# ================================================

Write-Host "=== PART 8: Generating processing report ===" -ForegroundColor Cyan

$reportPath = Join-Path $Global:BasePath "processing-report.txt"

if (-not $Global:ProcessingReport) {
    $Global:ProcessingReport = @()
}

$reportLines = @()
$reportLines += "SafeSteps Curriculum Engine - Processing Report"
$reportLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$reportLines += ""
$reportLines += "Summary:"
$reportLines += " - Total topic folders processed: $($Global:TopicFolders.Count)"
$reportLines += " - Total topics generated: $($Global:FinalTopics.Count)"
$reportLines += ""
$reportLines += "Detailed Log:"
$reportLines += $Global:ProcessingReport
$reportLines += ""

try {
    $reportLines | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host "Created processing-report.txt at: $reportPath" -ForegroundColor Green
    $Global:ProcessingReport += "Generated processing-report.txt"
}
catch {
    Write-Host "ERROR: Failed to write processing-report.txt" -ForegroundColor Red
    $Global:ProcessingReport += "ERROR: Failed to write processing-report.txt"
}

Write-Host "PART 8 complete: Report generated." -ForegroundColor Green
