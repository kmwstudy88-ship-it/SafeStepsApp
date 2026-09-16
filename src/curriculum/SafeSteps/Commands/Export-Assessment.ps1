. $PSScriptRoot\Get-Timestamp.ps1
function Export-Assessment {
    param([string]$Id)

    $assessment = Get-Assessment -Id $Id
    $output = $assessment | ConvertTo-Json -Depth 10
    $path = ".\export\$Id.json"

    New-Item -ItemType Directory -Path ".\export" -Force | Out-Null
    Set-Content -Path $path -Value $output

    Write-Host "Exported to $path"
}

