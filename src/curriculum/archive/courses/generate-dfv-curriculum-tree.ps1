# generate-dfv-curriculum-tree.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== Generating DFV curriculum tree ==="

function Get-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,
        [Parameter(Mandatory = $true)]
        [string] $Label
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing $Label file: $Path"
    }

    Write-Host "Loading $Label from $Path..."
    $raw = Get-Content -LiteralPath $Path -Raw

    if ([string]::IsNullOrWhiteSpace($raw)) {
        throw "$Label file is empty: $Path"
    }

    try {
        return ($raw | ConvertFrom-Json)
    }
    catch {
        throw "Invalid JSON in $Label file: $($_.Exception.Message)"
    }
}

# Resolve script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Input files
$parentIndexPath = Join-Path $scriptDir "dfv-parent-index.json"
$pwuvIndexPath   = Join-Path $scriptDir "dfv-pwuv-index.json"
$peerIndexPath   = Join-Path $scriptDir "dfv-peer-mentor-index.json"

# Output file
$outputPath = Join-Path $scriptDir "dfv-curriculum-tree.json"

# Load indexes
$parentIndex = Get-JsonFile -Path $parentIndexPath -Label "Parent index"
$pwuvIndex   = Get-JsonFile -Path $pwuvIndexPath   -Label "PWUV index"
$peerIndex   = Get-JsonFile -Path $peerIndexPath   -Label "Peer Mentor index"

Write-Host "All index files loaded successfully."

# Build tree object
Write-Host "Building DFV curriculum tree object..."

$tree = @{
    dfv = @{
        streams = @(
            @{
                name   = "dfv-parent"
                title  = "DFV Parent"
                topics = $parentIndex
            },
            @{
                name   = "dfv-pwuv"
                title  = "DFV PWUV"
                topics = $pwuvIndex
            },
            @{
                name   = "dfv-peer-mentor"
                title  = "DFV Parent Peer Mentor Training"
                topics = $peerIndex
            }
        )
    }
}

Write-Host "Tree object built."

# Write output
Write-Host "Writing curriculum tree to $outputPath..."

$tree |
    ConvertTo-Json -Depth 20 |
    Set-Content -LiteralPath $outputPath -Encoding UTF8

Write-Host "DFV curriculum tree written successfully."
Write-Host "=== Done ==="