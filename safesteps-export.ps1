param(
    [string]$OutputPath = ".\export\curriculum-bundle.json"
)

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Starting export to $OutputPath" -Level "INFO"

$exportDir = Split-Path -Parent $OutputPath
if (-not (Test-Path $exportDir)) {
    New-Item -ItemType Directory -Path $exportDir | Out-Null
}

$bundle = [PSCustomObject]@{
    exportedAt = (Get-Date).ToString("o")
    programs   = @()
    stages     = @()
    weeks      = @()
    lessons    = @()
}

foreach ($file in Get-ChildItem $paths.Programs -Filter *.json -ErrorAction SilentlyContinue) {
    $bundle.programs += (Get-Content $file.FullName -Raw | ConvertFrom-Json)
}
foreach ($file in Get-ChildItem $paths.Stages -Filter *.json -ErrorAction SilentlyContinue) {
    $bundle.stages += (Get-Content $file.FullName -Raw | ConvertFrom-Json)
}
foreach ($file in Get-ChildItem $paths.Weeks -Filter *.json -ErrorAction SilentlyContinue) {
    $bundle.weeks += (Get-Content $file.FullName -Raw | ConvertFrom-Json)
}
foreach ($file in Get-ChildItem $paths.Lessons -Filter *.json -ErrorAction SilentlyContinue) {
    $bundle.lessons += (Get-Content $file.FullName -Raw | ConvertFrom-Json)
}

$bundle | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $OutputPath

Write-SafeStepsLog -Message "Export completed to $OutputPath" -Level "INFO"
Write-Host "Export completed: $OutputPath" -ForegroundColor Green
