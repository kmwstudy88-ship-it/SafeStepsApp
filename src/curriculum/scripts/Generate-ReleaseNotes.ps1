# =====================================================================
# SAFE STEPS — RELEASE NOTES GENERATOR
# Creates human-readable release notes based on diffs and metadata
# =====================================================================

param(
    [string]$Version = "v1.0.0",
    [string]$OldExport,
    [string]$NewExport
)

$Root = Get-Location
$Dist = Join-Path $Root "dist"

if (-not (Test-Path $Dist)) {
    New-Item -ItemType Directory -Path $Dist | Out-Null
}

# Timestamp
$Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

# Output file
$NotesPath = Join-Path $Dist "release-notes-$Version.md"

Write-Host "`n=== SAFE STEPS — RELEASE NOTES GENERATOR ==="
Write-Host "Creating: $NotesPath`n"

# ---------------------------------------------------------------------
# LOAD EXPORTS
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return $null }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

$Old = Load-JsonSafe $OldExport
$New = Load-JsonSafe $NewExport

if (-not $Old -or -not $New) {
    Write-Host "ERROR: One or both export files could not be loaded."
    exit
}

# ---------------------------------------------------------------------
# FLATTEN JSON FOR DIFF
# ---------------------------------------------------------------------

$OldFlat = $Old | ConvertTo-Json -Depth 50 -Compress
$NewFlat = $New | ConvertTo-Json -Depth 50 -Compress

$OldLines = $OldFlat -split "`n"
$NewLines = $NewFlat -split "`n"

$Diff = Compare-Object $OldLines $NewLines -IncludeEqual -PassThru

# ---------------------------------------------------------------------
# CLASSIFY CHANGES
# ---------------------------------------------------------------------

$Added   = @()
$Removed = @()

foreach ($Line in $Diff) {

    if ($Line.SideIndicator -eq "=>") {
        $Added += $Line
    }
    elseif ($Line.SideIndicator -eq "<=") {
        $Removed += $Line
    }
}

# ---------------------------------------------------------------------
# WRITE RELEASE NOTES
# ---------------------------------------------------------------------

$Notes = @()
$Notes += "# SafeSteps Curriculum — Release Notes ($Version)"
$Notes += ""
$Notes += "**Generated:** $Timestamp"
$Notes += ""
$Notes += "---"
$Notes += ""
$Notes += "## Summary"
$Notes += "- Total additions: $($Added.Count)"
$Notes += "- Total removals: $($Removed.Count)"
$Notes += ""
$Notes += "---"
$Notes += ""
$Notes += "## Added"
if ($Added.Count -eq 0) {
    $Notes += "_No additions in this release._"
} else {
    foreach ($A in $Added) { $Notes += "- $A" }
}
$Notes += ""
$Notes += "## Removed"
if ($Removed.Count -eq 0) {
    $Notes += "_No removals in this release._"
} else {
    foreach ($R in $Removed) { $Notes += "- $R" }
}
$Notes += ""
$Notes += "## Notes"
$Notes += "- This release was generated automatically using the SafeSteps build pipeline."
$Notes += "- For full diff details, see the diff engine output."
$Notes += ""

# Save file
$Notes -join "`n" | Out-File $NotesPath -Encoding utf8

Write-Host "Release notes created successfully."
Write-Host "Location: $NotesPath`n"
