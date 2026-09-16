. $PSScriptRoot\Get-Timestamp.ps1
function New-Week {
    param(
        [string]$Id,
        [string]$Title
    )

    $path = Join-Path $PSScriptRoot "..\..\content\weeks\$Id.json"

    $template = @{
        id = $Id
        title = $Title
        lessons = @()
        objectives = @()
        outcomes = @()
    } | ConvertTo-Json -Depth 10

    Set-Content -Path $path -Value $template
    Write-Host "Created week: $path"
}

