. $PSScriptRoot\Get-Timestamp.ps1
function Get-Lessons {
    Get-ChildItem (Join-Path $PSScriptRoot "..\..\content\lessons") -Filter *.json |
        Select-Object -ExpandProperty BaseName
}

