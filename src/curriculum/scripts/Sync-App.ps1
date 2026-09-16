<#
    SafeSteps App Sync
    Copies:
      - SafeSteps.bundle.json
      - SafeSteps.master.index.json
      - SafeSteps.program.map.json
      - SafeSteps.lesson.index.json
      - SafeSteps.search.index.json
      - SafeSteps.search.index
    Into the React Native app assets folder.
#>

$CurriculumRoot = "C:\Users\SAFES\SafeStepsProject\safesteps-curriculum"
$AppAssets = "C:\Users\SAFES\SafeStepsApp\safesteps\assets"

$files = @(
    "SafeSteps.bundle.json",
    "SafeSteps.master.index.json",
    "SafeSteps.program.map.json",
    "SafeSteps.lesson.index.json",
    "SafeSteps.search.index.json",
    "SafeSteps.search.index"
)

Write-Host ""
Write-Host "=== Syncing SafeSteps App Assets ==="
Write-Host ""

foreach ($file in $files) {
    $src = Join-Path $CurriculumRoot $file
    $dst = Join-Path $AppAssets $file

    if (Test-Path $src) {
        Write-Host "Copying $file"
        Copy-Item -Path $src -Destination $dst -Force
    } else {
        Write-Host "WARNING: Missing file: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Sync Complete ==="
Write-Host ""
