Write-Host "=== Build-SafeSteps.ps1 ===" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

function Run-Step {
    param(
        [string]$Name,
        [string]$Script
    )

    Write-Host "`n[STEP] $Name" -ForegroundColor Yellow
    try {
        pwsh -File $Script
        Write-Host "[OK] $Name complete" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] $Name failed" -ForegroundColor Red
        Write-Host $_
        exit 1
    }
}

Run-Step -Name "Auto-fix curriculum"          -Script ".\scripts\Fix-CurriculumAuto.ps1"
Run-Step -Name "Generate base sections"       -Script ".\scripts\Generate-SectionFiles.ps1"
Run-Step -Name "Generate multi-sections"      -Script ".\scripts\Generate-MultiSections.ps1"
Run-Step -Name "Generate courses"             -Script ".\scripts\Generate-Courses.ps1"
Run-Step -Name "Merge master index"           -Script ".\scripts\Merge-Curriculum.ps1"
Run-Step -Name "Visualise curriculum"         -Script ".\scripts\Visualise-Curriculum.ps1"

Write-Host "`n=== SafeSteps Build Complete ===" -ForegroundColor Cyan
