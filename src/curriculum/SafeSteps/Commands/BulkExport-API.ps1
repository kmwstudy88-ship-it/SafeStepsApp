. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkExport-API {
    $root = Join-Path $PSScriptRoot "..\..\content"
    $exportPath = Join-Path $root "api_export.json"

    $bundle = @{
        exported_at = Get-Timestamp
        programs = Get-ChildItem "$root\programs" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        tasks = Get-ChildItem "$root\tasks" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        evidence = Get-ChildItem "$root\evidence" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        assessments = Get-ChildItem "$root\assessments" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        certificates = Get-ChildItem "$root\certificates" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        children = Get-ChildItem "$root\children" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
        audit_logs = Get-ChildItem "$root\audit_logs" -Recurse -Filter *.json | ForEach-Object { Get-Content $_ | ConvertFrom-Json }
    }

    $bundle | ConvertTo-Json -Depth 50 | Set-Content $exportPath
    Write-Host "API export created at: $exportPath"
}

