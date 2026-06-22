param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$versionRoot = "C:\SafeSteps\versions"
$versionPath = Join-Path $versionRoot $Version

$versionFile = Join-Path $versionPath "version.json"
$diffFile    = Join-Path $versionPath "diff.json"

if (-not (Test-Path $versionFile)) {
    Write-Host "version.json not found for $Version" -ForegroundColor Red
    exit
}

$version = Get-Content $versionFile -Raw | ConvertFrom-Json
$diff    = $null
if (Test-Path $diffFile) {
    $diff = Get-Content $diffFile -Raw | ConvertFrom-Json
}

$notesObj = [PSCustomObject]@{
    version   = $version.version
    createdAt = $version.createdAt
    notes     = $version.notes
    summary   = @{
        programs = $version.curriculum.programs
        stages   = $version.curriculum.stages
        weeks    = $version.curriculum.weeks
        lessons  = $version.curriculum.lessons
    }
    changes   = if ($diff) {
        @{
            added     = $diff.added
            removed   = $diff.removed
            modified  = $diff.modified
            unchanged = $diff.unchanged
        }
    } else {
        @{}
    }
}

$notesJsonPath = Join-Path $versionPath "release-notes.json"
$notesMdPath   = Join-Path $versionPath "release-notes.md"

$notesObj | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 -Path $notesJsonPath

$md = @()
$md += "# SafeSteps Curriculum Release Notes"
$md += ""
$md += "**Version:** $($version.version)"
$md += "**Created:** $($version.createdAt)"
if ($version.notes -and $version.notes -ne "") {
    $md += "**Notes:** $($version.notes)"
}
$md += ""
$md += "## Curriculum Summary"
$md += "- Programs: $($version.curriculum.programs)"
$md += "- Stages: $($version.curriculum.stages)"
$md += "- Weeks: $($version.curriculum.weeks)"
$md += "- Lessons: $($version.curriculum.lessons)"

if ($diff) {
    $md += ""
    $md += "## Changes"
    $md += "- Added: $($diff.added.Count)"
    $md += "- Removed: $($diff.removed.Count)"
    $md += "- Modified: $($diff.modified.Count)"
    $md += "- Unchanged: $($diff.unchanged.Count)"
}

$md | Set-Content -Encoding UTF8 -Path $notesMdPath

Write-Host "Release notes generated for version $Version" -ForegroundColor Green
