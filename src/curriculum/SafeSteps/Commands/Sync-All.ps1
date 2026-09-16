. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Sync-Item.ps1

function Sync-All {

    $root = Join-Path $PSScriptRoot "..\.."

    $paths = @(
        "$root\content\lessons\*.json",
        "$root\sections\*.json",
        "$root\programs\*.json",
        "$root\content\tasks\daily\*.json",
        "$root\content\tasks\weekly\*.json"
    )

    foreach ($pattern in $paths) {
        Get-ChildItem $pattern | ForEach-Object {
            Sync-Item -Path $_.FullName
        }
    }

    Write-Host "All items synced."
}

