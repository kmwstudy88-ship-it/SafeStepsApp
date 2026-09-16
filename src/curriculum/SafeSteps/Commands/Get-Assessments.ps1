. $PSScriptRoot\Get-Timestamp.ps1
function Get-Assessments {
    Get-ChildItem (Join-Path $PSScriptRoot "..\..\content\assessments") -Filter *.json |
        Select-Object -ExpandProperty BaseName
}

