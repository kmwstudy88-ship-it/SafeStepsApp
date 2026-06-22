param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Curriculum Lint Engine ===" -ForegroundColor Cyan

$report = [PSCustomObject]@{
    rootPath        = $CurriculumPath
    invalidJson     = @()
    missingFields   = @()
    badFilenames    = @()
    wrongFolders    = @()
}

# Check JSON validity
Get-ChildItem -Recurse $CurriculumPath -Filter *.json | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw | ConvertFrom-Json
    } catch {
        $report.invalidJson += $_.FullName
        return
    }

    # Simple required field checks for lessons/weeks/programs/stages
    if ($_.FullName -like "*lessons*") {
        if (-not $content.title -or -not $content.id) {
            $report.missingFields += [PSCustomObject]@{
                file   = $_.FullName
                type   = "lesson"
                fields = @("title","id") | Where-Object { -not $content.$_ }
            }
        }
    }

    if ($_.FullName -like "*weeks*") {
        if (-not $content.id -or -not $content.stageId) {
            $report.missingFields += [PSCustomObject]@{
                file   = $_.FullName
                type   = "week"
                fields = @("id","stageId") | Where-Object { -not $content.$_ }
            }
        }
    }

    if ($_.FullName -like "*programs*") {
        if (-not $content.id -or -not $content.name) {
            $report.missingFields += [PSCustomObject]@{
                file   = $_.FullName
                type   = "program"
                fields = @("id","name") | Where-Object { -not $content.$_ }
            }
        }
    }
}

# Filename checks
Get-ChildItem -Recurse $CurriculumPath -Filter *.json | ForEach-Object {
    $name = $_.Name
    if ($_.FullName -like "*lessons*") {
        if ($name -notlike "*lesson*.json") {
            $report.badFilenames += [PSCustomObject]@{
                file = $_.FullName
                rule = "lesson filename should contain 'lesson'"
            }
        }
    }
    if ($_.FullName -like "*weeks*") {
        if ($name -notlike "*week*.json") {
            $report.badFilenames += [PSCustomObject]@{
                file = $_.FullName
                rule = "week filename should contain 'week'"
            }
        }
    }
}

$lintJson = Join-Path $CurriculumPath "lint-report.json"
$lintMd   = Join-Path $CurriculumPath "lint-report.md"

$report | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $lintJson

$md = @()
$md += "# SafeSteps Curriculum Lint Report"
$md += ""
$md += "Root: $CurriculumPath"
$md += ""
$md += "## Invalid JSON"
$md += if ($report.invalidJson.Count) { $report.invalidJson } else { "None" }
$md += ""
$md += "## Missing Fields"
$md += if ($report.missingFields.Count) { ($report.missingFields | ForEach-Object { $_.file }) } else { "None" }
$md += ""
$md += "## Bad Filenames"
$md += if ($report.badFilenames.Count) { ($report.badFilenames | ForEach-Object { "$($_.file) - $($_.rule)" }) } else { "None" }

$md | Set-Content -Encoding UTF8 -Path $lintMd

Write-Host "Lint report written to $lintJson and $lintMd" -ForegroundColor Green
