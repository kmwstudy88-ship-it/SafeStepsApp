. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-CaseTransfer {
    $root = Join-Path $PSScriptRoot "..\..\content\transfers"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "case_transfer_01"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        export = @()
        import = @()
    }

    $path = Join-Path $root "case_transfer_01.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path

    Write-Host "Case Transfer Pack initialized"
}

