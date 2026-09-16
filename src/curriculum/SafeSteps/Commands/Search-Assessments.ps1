. $PSScriptRoot\Get-Timestamp.ps1
function Search-Assessments {
    param([string]$Keyword)

    $loader = Join-Path $PSScriptRoot "..\..\content\assessments\Load-Assessments.ps1"
    $assessments = & $loader

    $assessments.Keys |
        Where-Object { $_ -like "*$Keyword*" }
}

