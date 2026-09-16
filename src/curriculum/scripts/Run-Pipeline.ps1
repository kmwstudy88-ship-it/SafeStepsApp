# =====================================================================
# SAFE STEPS — FULL CI/CD PIPELINE
# Builds, validates, documents, packages, and deploys the curriculum
# =====================================================================

param(
    [string]$Version = "v1.0.0",
    [switch]$Deploy,
    [string]$DatabaseUrl,
    [string]$ApiKey
)

$Root = Get-Location
$Dist = Join-Path $Root "dist"

Write-Host "`n=== SAFE STEPS — FULL PIPELINE ($Version) ===`n"

# ---------------------------------------------------------------------
# STEP 1 — CLEANUP
# ---------------------------------------------------------------------

Write-Host "[1/10] Cleaning old build..."
pwsh -File .\scripts\Cleanup-SafeSteps.ps1

# ---------------------------------------------------------------------
# STEP 2 — BUILD STRUCTURE
# ---------------------------------------------------------------------

Write-Host "[2/10] Building program structure..."
pwsh -File .\scripts\Generate-ProgramStructure.ps1

# ---------------------------------------------------------------------
# STEP 3 — GENERATE CONTENT
# ---------------------------------------------------------------------

Write-Host "[3/10] Generating content..."
pwsh -File .\scripts\Populate-ProgramContent.ps1

# ---------------------------------------------------------------------
# STEP 4 — VALIDATE
# ---------------------------------------------------------------------

Write-Host "[4/10] Validating curriculum..."
pwsh -File .\scripts\Validate-Curriculum.ps1

# ---------------------------------------------------------------------
# STEP 5 — AUTO-REPAIR (IF NEEDED)
# ---------------------------------------------------------------------

Write-Host "[5/10] Auto-repairing issues..."
pwsh -File .\scripts\Fix-CurriculumAuto.ps1

# ---------------------------------------------------------------------
# STEP 6 — GENERATE DOCUMENTATION
# ---------------------------------------------------------------------

Write-Host "[6/10] Generating documentation..."
pwsh -File .\scripts\Generate-Documentation.ps1

# ---------------------------------------------------------------------
# STEP 7 — GENERATE WEB DOCS
# ---------------------------------------------------------------------

Write-Host "[7/10] Generating web documentation..."
pwsh -File .\scripts\Generate-WebDocs.ps1

# ---------------------------------------------------------------------
# STEP 8 — GENERATE API
# ---------------------------------------------------------------------

Write-Host "[8/10] Generating API..."
pwsh -File .\scripts\Generate-API.ps1

# ---------------------------------------------------------------------
# STEP 9 — DEPLOY (OPTIONAL)
# ---------------------------------------------------------------------

if ($Deploy) {
    Write-Host "[9/10] Deploying to Firebase..."
    pwsh -File .\scripts\Sync-API.ps1 `
        -DatabaseUrl $DatabaseUrl `
        -ApiKey $ApiKey
}
else {
    Write-Host "[9/10] Deployment skipped (use -Deploy to enable)"
}

# ---------------------------------------------------------------------
# STEP 10 — RELEASE NOTES
# ---------------------------------------------------------------------

Write-Host "[10/10] Generating release notes..."
$Old = Join-Path $Dist "export-prev.json"
$New = Join-Path $Dist "export-$Version.json"

pwsh -File .\scripts\Generate-ReleaseNotes.ps1 `
    -Version $Version `
    -OldExport $Old `
    -NewExport $New

Write-Host "`n=== PIPELINE COMPLETE ($Version) ==="
