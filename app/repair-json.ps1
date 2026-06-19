# Clean SafeSteps JSON Repair Script (Absolute Path)

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$path = Join-Path $ScriptRoot "..\safesteps\assets\SafeSteps.course.index.json"
$path = Resolve-Path $path

if (-not (Test-Path $path)) {
    Write-Host "JSON file not found at: $path"
    exit
}

$jsonText = Get-Content $path -Raw

if ([string]::IsNullOrWhiteSpace($jsonText)) {
    Write-Host "JSON file is empty. Cannot repair."
    exit
}

try {
    $json = $jsonText | ConvertFrom-Json
    Write-Host "JSON is valid. Formatting and saving..."
    $json | ConvertTo-Json -Depth 20 | Set-Content $path
}
catch {
    Write-Host "JSON is invalid. Manual review required."
}