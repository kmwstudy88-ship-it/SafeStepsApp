. $PSScriptRoot\Get-Timestamp.ps1
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    $Args
)

& "$PSScriptRoot\SafeStepsRouter.ps1" @Args

