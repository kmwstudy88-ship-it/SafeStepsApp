# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 9 of 10 — Summary
# ================================================

Write-Host "=== PART 9: Summary ===" -ForegroundColor Cyan

Write-Host "Topic folders found: $($Global:TopicFolders.Count)" -ForegroundColor Green
Write-Host "Topics generated: $($Global:FinalTopics.Count)" -ForegroundColor Green

$sampleCount = [Math]::Min(10, $Global:FinalTopics.Count)
if ($sampleCount -gt 0) {
    Write-Host ""
    Write-Host "Sample topics:" -ForegroundColor Cyan
    $Global:FinalTopics.Keys |
        Sort-Object |
        Select-Object -First $sampleCount |
        ForEach-Object {
            $t = $Global:FinalTopics[$_]
            Write-Host " - [$($_)] $($t.title)" -ForegroundColor DarkCyan
        }
}

Write-Host "PART 9 complete: Summary printed." -ForegroundColor Green
