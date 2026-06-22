param(
    [Parameter(Mandatory=$true)]
    [string]$OldPath,

    [Parameter(Mandatory=$true)]
    [string]$NewPath
)

Write-Host "=== SafeSteps Curriculum Diff Engine ===" -ForegroundColor Cyan
Write-Host "Comparing:" -ForegroundColor Yellow
Write-Host "OLD: $OldPath" -ForegroundColor Gray
Write-Host "NEW: $NewPath" -ForegroundColor Gray

function Load-Files($path) {
    $files = @{}
    Get-ChildItem -Path $path -Recurse -Filter *.json | ForEach-Object {
        try {
            $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
            $files[$_.FullName.Replace($path, "")] = $json
        } catch {}
    }
    return $files
}

$oldFiles = Load-Files $OldPath
$newFiles = Load-Files $NewPath

$diff = [PSCustomObject]@{
    added      = @()
    removed    = @()
    modified   = @()
    unchanged  = @()
}

# Detect added + removed
foreach ($file in $newFiles.Keys) {
    if (-not $oldFiles.ContainsKey($file)) {
        $diff.added += $file
    }
}

foreach ($file in $oldFiles.Keys) {
    if (-not $newFiles.ContainsKey($file)) {
        $diff.removed += $file
    }
}

# Detect modified
foreach ($file in $newFiles.Keys) {
    if ($oldFiles.ContainsKey($file)) {
        $oldJson = $oldFiles[$file] | ConvertTo-Json -Depth 20
        $newJson = $newFiles[$file] | ConvertTo-Json -Depth 20

        if ($oldJson -ne $newJson) {
            $diff.modified += $file
        } else {
            $diff.unchanged += $file
        }
    }
}

# Output
$diffRoot = Join-Path $PSScriptRoot "diff"
if (-not (Test-Path $diffRoot)) {
    New-Item -ItemType Directory -Path $diffRoot | Out-Null
}

$diff | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $diffRoot "curriculum-diff.json")

Write-Host "=== Diff Completed ===" -ForegroundColor Green
Write-Host "Added: $($diff.added.Count)" -ForegroundColor Yellow
Write-Host "Removed: $($diff.removed.Count)" -ForegroundColor Yellow
Write-Host "Modified: $($diff.modified.Count)" -ForegroundColor Yellow
Write-Host "Unchanged: $($diff.unchanged.Count)" -ForegroundColor Yellow
