# validate-dfv-schema.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "=== Validating DFV Curriculum JSON Files ==="

function Test-JsonFile {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string] $JsonPath,

        [Parameter(Mandatory)]
        [string] $SchemaPath,

        [Parameter(Mandatory)]
        [string] $Label
    )

    if (-not (Test-Path -LiteralPath $JsonPath)) {
        Write-Host "[FAIL] $Label missing: $JsonPath" -ForegroundColor Red
        return $false
    }

    if (-not (Test-Path -LiteralPath $SchemaPath)) {
        Write-Host "[FAIL] Schema missing: $SchemaPath" -ForegroundColor Red
        return $false
    }

    Write-Host "Validating $Label..."

    try {
        $json   = Get-Content -LiteralPath $JsonPath -Raw
        $schema = Get-Content -LiteralPath $SchemaPath -Raw

        $result = Test-Json -Json $json -Schema $schema

        if ($result) {
            Write-Host "[PASS] $Label is valid" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "[FAIL] $Label is INVALID" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "[ERROR] $Label validation error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Resolve script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Schema files
$topicSchema = Join-Path $scriptDir "topic-index.schema.json"
$treeSchema  = Join-Path $scriptDir "dfv-curriculum-tree.schema.json"

# JSON files
$parentIndex = Join-Path $scriptDir "dfv-parent-index.json"
$pwuvIndex   = Join-Path $scriptDir "dfv-pwuv-index.json"
$peerIndex   = Join-Path $scriptDir "dfv-peer-mentor-index.json"
$treeFile    = Join-Path $scriptDir "dfv-curriculum-tree.json"

# Run validations
$results = @()

$results += Test-JsonFile -JsonPath $parentIndex -SchemaPath $topicSchema -Label "Parent Index"
$results += Test-JsonFile -JsonPath $pwuvIndex   -SchemaPath $topicSchema -Label "PWUV Index"
$results += Test-JsonFile -JsonPath $peerIndex   -SchemaPath $topicSchema -Label "Peer Mentor Index"
$results += Test-JsonFile -JsonPath $treeFile    -SchemaPath $treeSchema  -Label "Curriculum Tree"

# Summary
if ($results -contains $false) {
    Write-Host "`n=== VALIDATION FAILED ===" -ForegroundColor Red
    exit 1
}
else {
    Write-Host "`n=== ALL FILES VALID ===" -ForegroundColor Green
    exit 0
}
