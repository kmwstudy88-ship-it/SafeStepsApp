. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Assessments {
    $ids = Get-Assessments
    foreach ($id in $ids) {
        Write-Host "Validating $id..."
        Validate-Assessment -Id $id
    }
}

