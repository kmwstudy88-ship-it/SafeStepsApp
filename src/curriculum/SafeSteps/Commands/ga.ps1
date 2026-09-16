. $PSScriptRoot\Get-Timestamp.ps1
function ga {
    param(
        [Parameter(Mandatory)]
        [string]$Id
    )

    # Allow shorthand like "h" → "section_h_aod_parenting_capacity"
    switch ($Id.ToLower()) {
        "h" { $Id = "section_h_aod_parenting_capacity" }
    }

    Get-Assessment -Id $Id
}

