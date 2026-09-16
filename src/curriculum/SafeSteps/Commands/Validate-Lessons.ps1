. $PSScriptRoot\Get-Timestamp.ps1
function Validate-Lessons {
    $ids = Get-Lessons
    foreach ($id in $ids) {
        Write-Host "Validating $id..."
        Validate-Lesson -Id $id
    }
}

