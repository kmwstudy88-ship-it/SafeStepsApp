param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Curriculum Optimize Engine ===" -ForegroundColor Cyan

$changes = @()

Get-ChildItem -Recurse $CurriculumPath -Filter *.json | ForEach-Object {
    try {
        $raw     = Get-Content $_.FullName -Raw
        $content = $raw | ConvertFrom-Json
    } catch {
        return
    }

    # Remove empty properties
    $props = $content.PSObject.Properties | Where-Object { $_.Value -ne $null -and $_.Value -ne "" }
    $ordered = [ordered]@{}
    foreach ($p in ($props | Sort-Object Name)) {
        $ordered[$p.Name] = $p.Value
    }

    $optimized = New-Object PSObject -Property $ordered
    $newJson   = $optimized | ConvertTo-Json -Depth 20

    if ($newJson -ne $raw) {
        $newJson | Set-Content -Encoding UTF8 -Path $_.FullName
        $changes += $_.FullName
    }
}

$report = [PSCustomObject]@{
    rootPath = $CurriculumPath
    optimizedFiles = $changes
}

$optJson = Join-Path $CurriculumPath "optimize-report.json"
$report | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $optJson

Write-Host "Optimization complete. Report: $optJson" -ForegroundColor Green
