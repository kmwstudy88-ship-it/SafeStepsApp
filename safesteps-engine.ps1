param(
    [Parameter(Mandatory=$true)]
    [string]$Command,

    [string]$Arg1,
    [string]$Arg2
)

$tools = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $tools -Force

function Get-Default {
    param($Value, $Fallback)
    if ([string]::IsNullOrWhiteSpace($Value)) { return $Fallback }
    return $Value
}

function Invoke-SafeStepsGenerate {
    $program = Get-Default -Value $Arg1 -Fallback "SafeSteps Program"
    $stage   = Get-Default -Value $Arg2 -Fallback "Stage 1"

    Write-SafeStepsLog -Message "Running GENERATE engine: Program=$program Stage=$stage"
    & "$PSScriptRoot\safesteps-generate.ps1" -ProgramName $program -StageName $stage
}

function Invoke-SafeStepsValidate {
    Write-SafeStepsLog -Message "Running VALIDATE engine"
    & "$PSScriptRoot\safesteps-validate.ps1" -Strict
}

function Invoke-SafeStepsExport {
    Write-SafeStepsLog -Message "Running EXPORT engine"
    & "$PSScriptRoot\safesteps-export.ps1"
}

switch ($Command.ToLower()) {

    "generate" {
        Invoke-SafeStepsGenerate
    }

    "validate" {
        Invoke-SafeStepsValidate
    }

    "export" {
        Invoke-SafeStepsExport
    }

    "full" {
        Write-Host "=== SAFE STEPS FULL RUN ===" -ForegroundColor Cyan
        Invoke-SafeStepsGenerate
        Invoke-SafeStepsValidate
        Invoke-SafeStepsExport
        Write-Host "=== FULL RUN COMPLETE ===" -ForegroundColor Green
    }

    default {
        throw "Unknown SafeSteps command: $Command"
    }
}
