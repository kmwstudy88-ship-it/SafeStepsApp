param(
    [string]$ModulesFolder = "modules",
    [string]$OutputFile = "curriculum_index.json"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $root -Parent

$modulesPath = Join-Path $repoRoot $ModulesFolder
$outputPath  = Join-Path $repoRoot $OutputFile

$moduleFiles = Get-ChildItem -Path $modulesPath -Filter "module_*.json"

$modules = foreach ($file in $moduleFiles) {
    Get-Content $file.FullName -Raw | ConvertFrom-Json
}

$streams = $modules |
    Group-Object level |
    ForEach-Object {
        [PSCustomObject]@{
            id      = $_.Name
            title   = ($_.Name -replace "_", " ") -creplace "^\w", { $_.Value.ToUpper() }
            modules = $_.Group | Sort-Object title | ForEach-Object {
                [PSCustomObject]@{
                    id    = $_.id
                    title = $_.title
                }
            }
        }
    } | Sort-Object id

$index = [PSCustomObject]@{
    streams = $streams
}

$index | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8

Write-Host "Curriculum index written to $outputPath"
