. $PSScriptRoot\Get-Timestamp.ps1
function Export-Assessments {
    $loader = Join-Path $PSScriptRoot "..\..\content\assessments\Load-Assessments.ps1"
    $assessments = & $loader

    New-Item -ItemType Directory -Path ".\export" -Force | Out-Null

    foreach ($id in $assessments.Keys) {
        $path = ".\export\$id.json"
        ($assessments[$id] | ConvertTo-Json -Depth 10) | Set-Content -Path $path
    }

    Write-Host "Export complete."
}

