. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Weeks {
    $ids = Get-Weeks
    foreach ($id in $ids) {
        Write-Host "Validating $id..."
        Validate-Week -Id $id
    }
}

