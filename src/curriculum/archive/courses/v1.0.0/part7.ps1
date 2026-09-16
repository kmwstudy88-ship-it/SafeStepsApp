# ================================================
# SAFE STEPS CURRICULUM ENGINE v1
# PART 7 of 10 — Validate topics
# ================================================

Write-Host "=== PART 7: Validating topics ===" -ForegroundColor Cyan

$errors = 0

foreach ($slug in $Global:FinalTopics.Keys) {
    $t = $Global:FinalTopics[$slug]

    if ([string]::IsNullOrWhiteSpace($t.title)) {
        Write-Host "WARN: Topic '$slug' has no title." -ForegroundColor Yellow
        $errors++
    }

    if (-not $t.sections -or $t.sections.Count -eq 0) {
        Write-Host "WARN: Topic '$slug' has no sections." -ForegroundColor Yellow
        $errors++
    }
}

if ($errors -gt 0) {
    Write-Host "Validation completed with $errors warnings." -ForegroundColor Yellow
    $Global:ProcessingReport += "Validation completed with $errors warnings."
}
else {
    Write-Host "Validation completed with no structural issues." -ForegroundColor Green
    $Global:ProcessingReport += "Validation completed with no structural issues."
}

Write-Host "PART 7 complete: Validation finished." -ForegroundColor Green
