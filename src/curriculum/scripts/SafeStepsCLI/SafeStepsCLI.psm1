# SafeSteps CLI - Main Module Loader

$commandPath = Join-Path $PSScriptRoot "commands"

Get-ChildItem -Path $commandPath -Filter *.ps1 | ForEach-Object {
    . $_.FullName
}
