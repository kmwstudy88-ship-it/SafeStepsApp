# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 5 of 10 — Normalize topics
# ================================================

Write-Host "=== PART 5: Normalizing topics ===" -ForegroundColor Cyan

$slugs = @($Global:FinalTopics.Keys)

foreach ($slug in $slugs) {
    $Global:FinalTopics[$slug] = Normalize-Topic $Global:FinalTopics[$slug]
}

Write-Host "PART 5 complete: All topics normalized." -ForegroundColor Green
$Global:ProcessingReport += "Normalized all topics."
