# === VALIDATE ALL JSON FILES IN BOTH TRACKS ===

$root = "C:\Users\SAFES\safesteps-curriculum\courses"

$tracks = @(
    "behaviour-change-accountability-fathers",
    "accountability-behaviour-change-universal"
)

$errors = @()

foreach ($track in $tracks) {
    $trackPath = Join-Path $root $track
    Write-Host ""
    Write-Host "=== Validating JSON in track: $track ==="
    Write-Host ""

    Get-ChildItem -Path $trackPath -Recurse -Filter "course.json" | ForEach-Object {
        $file = $_.FullName

        try {
            $content = Get-Content -Path $file -Raw
            $null = $content | ConvertFrom-Json
            Write-Host "OK  - $file"
        }
        catch {
            Write-Host "ERR - $file"
            $errors