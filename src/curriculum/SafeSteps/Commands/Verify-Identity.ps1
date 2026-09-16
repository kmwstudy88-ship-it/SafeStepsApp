. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Verify-Identity {
    param(
        [string]$ParentName,
        [string]$DocumentType,
        [string]$DocumentId
    )

    $path = Join-Path $PSScriptRoot "..\..\content\identity.json"
    $ts = Get-Timestamp

    $data = @{
        parent_name   = $ParentName
        document_type = $DocumentType
        document_id   = $DocumentId
        verified_at   = $ts
    }

    $data | ConvertTo-Json -Depth 10 | Set-Content $path
    Write-Host "Identity verified"
}

