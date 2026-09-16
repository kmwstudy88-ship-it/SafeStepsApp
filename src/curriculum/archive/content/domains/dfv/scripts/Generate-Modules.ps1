# scripts\Generate-Modules.ps1
param(
    [string]$CurriculumFile = "curriculum_all_modules.json",
    [string]$ModulesFolder = "modules"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $root -Parent

$curriculumPath = Join-Path $repoRoot $CurriculumFile
$modulesPath    = Join-Path $repoRoot $ModulesFolder

if (-not (Test-Path $curriculumPath)) {
    Write-Error "Curriculum file not found: $curriculumPath"
    exit 1
}

if (-not (Test-Path $modulesPath)) {
    New-Item -ItemType Directory -Path $modulesPath | Out-Null
}

$modules = Get-Content $curriculumPath -Raw | ConvertFrom-Json

foreach ($m in $modules) {
    if (-not $m.id) {
        Write-Warning "Skipping module with no id."
        continue
    }

    # Ensure safe filename
    $safeId   = ($m.id -replace '[^a-zA-Z0-9_\-]', '_')
    $fileName = "$safeId.json"

    # If you prefer the "module_" prefix enforced, uncomment:
    # if (-not $safeId.StartsWith("module_")) { $safeId = "module_$safeId" ; $fileName = "$safeId.json" }

    $filePath = Join-Path $modulesPath $fileName

    $jsonOut = $m | ConvertTo-Json -Depth 10
    $jsonOut | Set-Content -Path $filePath -Encoding UTF8

    Write-Host "Wrote $fileName"
}
