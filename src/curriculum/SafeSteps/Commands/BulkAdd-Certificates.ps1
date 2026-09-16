. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-Certificates {
    $root = Join-Path $PSScriptRoot "..\..\content\certificates"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $certs = @(
        @{ id="cert_parenting_skills"; title="Parenting Skills Program Completion" },
        @{ id="cert_substance_recovery"; title="Substance Recovery Milestone" },
        @{ id="cert_safe_housing"; title="Safe Housing Stability" }
    )

    foreach ($c in $certs) {
        $ts = Get-Timestamp
        $obj = @{
            id = $c.id
            title = $c.title
            issued_at = $ts
            verified = $false
            verified_at = $null
        }
        $path = Join-Path $root "$($c.id).json"
        $obj | ConvertTo-Json -Depth 20 | Set-Content $path
        Write-Host "Created certificate: $($c.id)"
    }
}

