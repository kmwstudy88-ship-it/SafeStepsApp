# ============================================================
# Force‑Fix Empty Modules (SafeSteps)
# Ensures each module has: id, title, level, lessons:[]
# ============================================================

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $repoRoot -Parent
$modulesPath = Join-Path $repoRoot "modules"

$targets = @(
    "module_accountability_foundations.json",
    "module_emotional_regulation.json",
    "module_relationship_skills.json",
    "module_sustainable_change.json",
    "module_system_navigation.json"
)

foreach ($file in $targets) {

    $path = Join-Path $modulesPath $file

    if (Test-Path $path) {

        # Extract ID from filename
        $id = $file -replace ".json",""

        # Convert ID to a readable title
        $title = ($id -replace "module_","") -replace "_"," "
        $title = (Get-Culture).TextInfo.ToTitleCase($title)

        # Build correct module structure
        $module = [PSCustomObject]@{
            id      = $id
            title   = $title
            level   = "general"
            lessons = @()
        }

        # Save it
        $module | ConvertTo-Json -Depth 10 | Set-Content -Path $path -Encoding UTF8

        Write-Host "Fixed → $file"
    }
    else {
        Write-Host "Missing file → $file" -ForegroundColor Yellow
    }
}
