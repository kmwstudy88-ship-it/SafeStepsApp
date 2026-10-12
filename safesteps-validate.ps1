param(
    [switch]$Strict
)

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths

Write-SafeStepsLog -Message "Starting validation. Strict = $Strict" -Level "INFO"

$requiredDirs = @(
    $paths.Root,
    $paths.Programs,
    $paths.Stages,
    $paths.Weeks,
    $paths.Lessons
)

$allOk = $true

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-SafeStepsLog -Message "Missing directory: $dir" -Level "ERROR"
        Write-Host "[ERROR] Missing directory: $dir" -ForegroundColor Red
        $allOk = $false
    } else {
        Write-Host "[OK] $dir" -ForegroundColor Green
    }
}

$curriculumJson = Get-ChildItem -Path $paths.Root -Recurse -Filter *.json -ErrorAction SilentlyContinue
foreach ($file in $curriculumJson) {
    try {
        Get-Content $file.FullName -Raw | ConvertFrom-Json | Out-Null
        Write-Host "[OK] JSON valid: $($file.FullName)" -ForegroundColor Green
    }
    catch {
        Write-SafeStepsLog -Message "Invalid JSON: $($file.FullName) - $($_.Exception.Message)" -Level "ERROR"
        Write-Host "[ERROR] Invalid JSON: $($file.FullName)" -ForegroundColor Red
        $allOk = $false
    }
}

if ($Strict -and -not $allOk) {
    Write-SafeStepsLog -Message "Validation failed in strict mode." -Level "ERROR"
    throw "SafeSteps validation failed in strict mode."
}

if ($allOk) {
    Write-SafeStepsLog -Message "Validation completed successfully." -Level "INFO"
    Write-Host "Validation completed successfully." -ForegroundColor Green
} else {
    Write-Host "Validation completed with errors." -ForegroundColor Yellow
}
