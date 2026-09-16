. $PSScriptRoot\Get-Timestamp.ps1
function ExifTool {
    param([string]$FilePath)

    $exe = "C:\Users\SAFES\safesteps-curriculum\tools\exiftool.exe"

    if (-not (Test-Path $exe)) {
        Write-Warning "ExifTool executable not found at $exe"
        return
    }

    & $exe $FilePath
}

