. $PSScriptRoot\Get-Timestamp.ps1
function Reload-Assessments {
    Import-Module ".\SafeSteps\SafeSteps.psm1" -Force
    Write-Host "SafeSteps module reloaded."
}

