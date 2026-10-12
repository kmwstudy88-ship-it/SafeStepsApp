param()

$versionRoot = "C:\SafeSteps\versions"
if (-not (Test-Path $versionRoot)) {
    Write-Host "No versions directory found." -ForegroundColor Yellow
    exit
}

$versions = Get-ChildItem $versionRoot | Where-Object { $_.PSIsContainer } | Sort-Object Name

$result = @()

foreach ($v in $versions) {
    $versionFile = Join-Path $v.FullName "version.json"
    if (Test-Path $versionFile) {
        $meta = Get-Content $versionFile -Raw | ConvertFrom-Json
        $result += [PSCustomObject]@{
            version   = $meta.version
            createdAt = $meta.createdAt
            notes     = $meta.notes
            programs  = $meta.curriculum.programs
            stages    = $meta.curriculum.stages
            weeks     = $meta.curriculum.weeks
            lessons   = $meta.curriculum.lessons
        }
    }
}

$result | Format-Table -AutoSize

$result | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path (Join-Path $versionRoot "versions-index.json")

Write-Host "Versions index written to versions-index.json" -ForegroundColor Green
