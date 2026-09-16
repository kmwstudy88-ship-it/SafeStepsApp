. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function BulkAdd-Children {
    $root = Join-Path $PSScriptRoot "..\..\content\children"
    if (-not (Test-Path $root)) { New-Item -ItemType Directory -Path $root -Force | Out-Null }

    $kids = @(
        @{ id="child_01"; name="Child A"; dob="2015-04-12" },
        @{ id="child_02"; name="Child B"; dob="2018-09-03" },
        @{ id="child_03"; name="Child C"; dob="2020-11-21" }
    )

    foreach ($k in $kids) {
        $ts = Get-Timestamp
        $obj = @{
            id = $k.id
            name = $k.name
            dob = $k.dob
            created_at = $ts
            updated_at = $ts
            linked_programs = @()
        }
        $path = Join-Path $root "$($k.id).json"
        $obj | ConvertTo-Json -Depth 20 | Set-Content $path
        Write-Host "Created child record: $($k.id)"
    }
}

