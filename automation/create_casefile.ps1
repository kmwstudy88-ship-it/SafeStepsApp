param(
    [Parameter(Mandatory = $true)]
    [string]$CaseID,

    [Parameter(Mandatory = $true)]
    [ValidateSet("single", "joint", "dual")]
    [string]$AccountMode,

    [Parameter(Mandatory = $true)]
    [string]$MotherID,

    [Parameter(Mandatory = $true)]
    [string]$FatherID,

    [string]$OutputRoot = (Get-Location).Path
)

$toolPath = Join-Path $PSScriptRoot "..\SafeStepsTools\New-SafeStepsCasefile.ps1"
& $toolPath -CaseID $CaseID -AccountMode $AccountMode -MotherID $MotherID -FatherID $FatherID -OutputRoot $OutputRoot
