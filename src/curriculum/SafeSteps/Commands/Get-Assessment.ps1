. $PSScriptRoot\Get-Timestamp.ps1
function Get-Assessment {
    param(
        [Parameter(Mandatory)]
        [string]$Id
    )

    # Correct path: go up TWO levels from SafeSteps/Commands
    $loader = Join-Path $PSScriptRoot "..\..\content\assessments\Load-Assessments.ps1"

    if (-not (Test-Path $loader)) {
        throw "Loader script not found: $loader"
    }

    $assessments = & $loader

    if ($assessments.ContainsKey($Id)) {
        return $assessments[$Id]
    }

    Write-Warning "Assessment not found: $Id"
}

