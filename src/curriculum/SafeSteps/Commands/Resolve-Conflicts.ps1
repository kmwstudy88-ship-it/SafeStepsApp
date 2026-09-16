. $PSScriptRoot\Get-Timestamp.ps1
function Resolve-Conflicts {
    param(
        [string]$LocalPath,
        [string]$ServerPath
    )

    $local = Get-Content $LocalPath | ConvertFrom-Json
    $server = Get-Content $ServerPath | ConvertFrom-Json

    if ($local.updated_at -gt $server.updated_at) {
        Copy-Item $LocalPath $ServerPath -Force
        Write-Host "Local version kept"
    } else {
        Copy-Item $ServerPath $LocalPath -Force
        Write-Host "Server version kept"
    }
}

