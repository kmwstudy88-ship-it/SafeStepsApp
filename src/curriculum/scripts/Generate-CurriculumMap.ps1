param(
    [string]$ModulesFolder = "modules",
    [string]$LessonsFolder = "lessons",
    [string]$OutputFile = "curriculum_map.json"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path $root -Parent

$modulesPath = Join-Path $repoRoot $ModulesFolder
$lessonsPath = Join-Path $repoRoot $LessonsFolder
$outputPath  = Join-Path $repoRoot $OutputFile

$modules = Get-ChildItem -Path $modulesPath -Filter "module_*.json" |
    ForEach-Object { Get-Content $_.FullName -Raw | ConvertFrom-Json }

$lessons = Get-ChildItem -Path $lessonsPath -Filter "lesson_*.json" |
    ForEach-Object { Get-Content $_.FullName -Raw | ConvertFrom-Json }

$streams = $modules |
    Group-Object level |
    ForEach-Object {
        $streamModules = $_.Group | Sort-Object title | ForEach-Object {
            $moduleLessons = $lessons | Where-Object { $_.module -eq $_.id }

            [PSCustomObject]@{
                id      = $_.id
                title   = $_.title
                lessons = $moduleLessons | Select-Object id, title
            }
        }

        [PSCustomObject]@{
            id      = $_.Name
            title   = ($_.Name -replace "_", " ") -creplace "^\w", { $_.Value.ToUpper() }
            modules = $streamModules
        }
    }

$map = [PSCustomObject]@{
    streams = $streams
    modules = $modules
    lessons = $lessons
}

$map | ConvertTo-Json -Depth 10 | Set-Content -Path $outputPath -Encoding UTF8

Write-Host "Curriculum map written to $outputPath"
