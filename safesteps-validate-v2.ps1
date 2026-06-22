param(
    [string]$Root = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Validation Engine v2 ===" -ForegroundColor Cyan

$report = [ordered]@{
    invalidJson   = @()
    missingFields = @()
    badStructure  = @()
    invalidRefs   = @()
}

$files = Get-ChildItem -Recurse $Root -Filter *.json

# Load all JSON into map
$map = @{}
foreach ($f in $files) {
    try {
        $json = Get-Content $f.FullName -Raw | ConvertFrom-Json
        $map[$json.id] = @{
            file = $f.FullName
            data = $json
        }
    } catch {
        $report.invalidJson += $f.FullName
    }
}

# Validate structure + references
foreach ($id in $map.Keys) {
    $item = $map[$id].data

    if ($item.type -eq "lesson") {
        if (-not $item.title -or -not $item.content) {
            $report.missingFields += $map[$id].file
        }
    }

    if ($item.references) {
        foreach ($r in $item.references) {
            if (-not $map.ContainsKey($r)) {
                $report.invalidRefs += "$id → $r"
            }
        }
    }
}

$path = Join-Path $Root "validate-v2-report.json"
$report | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Validation v2 complete: $path" -ForegroundColor Green
