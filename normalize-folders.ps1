Write-Host "Normalizing SafeSteps folder structure..."

$root = "C:\Users\SAFES\SafeStepsApp"

# Required folders for SafeSteps
$required = @(
    "SafeStepsTools",
    "safesteps-curriculum",
    "safesteps-curriculum\weeks",
    "safesteps-curriculum\lessons",
    "engine",
    "app",
    "scripts",
    "src",
    "src\curriculum"
)

foreach ($folder in $required) {
    $path = Join-Path $root $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
        Write-Host "Created missing folder: $path"
    }
}

Write-Host "Folder normalization complete."
