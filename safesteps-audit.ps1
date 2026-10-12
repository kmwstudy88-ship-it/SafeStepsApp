param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$versionRoot = "C:\SafeSteps\versions"
$versionPath = Join-Path $versionRoot $Version

if (-not (Test-Path $versionPath)) {
    Write-Host "Version $Version not found." -ForegroundColor Red
    exit
}

$curr = "$versionPath\curriculum"

$integrityScript = Join-Path $PSScriptRoot "safesteps-integrity.ps1"
$diffScript      = Join-Path $PSScriptRoot "safesteps-diff.ps1"

& $integrityScript
$integrity = Get-Content ".\curriculum\integrity\integrity-report.json" -Raw | ConvertFrom-Json

$versions = Get-ChildItem $versionRoot | Sort-Object Name
$prev = $null
foreach ($v in $versions) {
    if ($v.Name -ne $Version) { $prev = $v.Name }
}

$diff = $null
if ($prev) {
    & $diffScript -OldPath "$versionRoot\$prev\curriculum" -NewPath $curr
    $diff = Get-Content "$PSScriptRoot\diff\curriculum-diff.json" -Raw | ConvertFrom-Json
}

$audit = [PSCustomObject]@{
    version   = $Version
    integrity = $integrity
    diff      = $diff
}

$audit | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path (Join-Path $versionPath "audit-report.json")

$md = @()
$md += "# SafeSteps Curriculum Audit Report"
$md += "Version: $Version"
$md += ""
$md += "## Integrity Summary"
$md += "- Broken links: $($integrity.summary.brokenLinks)"
$md += "- Orphan lessons: $($integrity.summary.orphanLessons)"
$md += "- Missing content: $($integrity.summary.missingContent)"
$md += "- Invalid IDs: $($integrity.summary.invalidIds)"
$md += "- Duplicate IDs: $($integrity.summary.duplicateIds)"

if ($diff) {
    $md += ""
    $md += "## Diff Summary"
    $md += "- Added: $($diff.added.Count)"
    $md += "- Removed: $($diff.removed.Count)"
    $md += "- Modified: $($diff.modified.Count)"
}

$md | Set-Content -Encoding UTF8 -Path (Join-Path $versionPath "audit-report.md")

Write-Host "Audit complete for version $Version" -ForegroundColor Green
