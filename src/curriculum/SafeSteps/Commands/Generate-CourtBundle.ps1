. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Generate-CourtBundle {
    param([string]$OutputFolder)

    $root = Join-Path $PSScriptRoot "..\.."

    if (-not (Test-Path $OutputFolder)) {
        New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
    }

    Copy-Item "$root\content\*" $OutputFolder -Recurse -Force
    Copy-Item "$root\programs\*" $OutputFolder -Recurse -Force
    Copy-Item "$root\sections\*" $OutputFolder -Recurse -Force

    Write-Host "Court bundle generated at $OutputFolder"
}

