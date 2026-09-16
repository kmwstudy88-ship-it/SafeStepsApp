. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-ProgressHeatmap {
    $root = Join-Path $PSScriptRoot "..\..\content\analytics\progress_heatmap"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $obj = @{
        id = "progress_heatmap"
        created_at = Get-Timestamp
        updated_at = Get-Timestamp
        dimensions = @("safety","parenting","substance_use","mental_health","housing","contact")
        data_points = @()
    }

    $path = Join-Path $root "progress_heatmap.json"
    $obj | ConvertTo-Json -Depth 20 | Set-Content $path
    Write-Host "Progress Heatmap initialized"
}

