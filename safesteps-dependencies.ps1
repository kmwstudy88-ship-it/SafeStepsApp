param(
    [string]$CurriculumPath = "C:\Users\SAFES\SafeStepsApp\curriculum"
)

Write-Host "=== SafeSteps Dependency Engine ===" -ForegroundColor Cyan

$deps = [ordered]@{
    programs = @()
    stages   = @()
    weeks    = @()
    lessons  = @()
    missing  = @()
}

# Load all JSON
$files = Get-ChildItem -Recurse $CurriculumPath -Filter *.json
$map = @{}

foreach ($f in $files) {
    try {
        $json = Get-Content $f.FullName -Raw | ConvertFrom-Json
        $map[$json.id] = @{
            file = $f.FullName
            data = $json
        }
    } catch {}
}

# Build dependency graph
foreach ($id in $map.Keys) {
    $item = $map[$id].data

    if ($item.type -eq "program") {
        $deps.programs += [PSCustomObject]@{
            id     = $id
            stages = $item.stages
        }
    }

    if ($item.type -eq "stage") {
        $deps.stages += [PSCustomObject]@{
            id    = $id
            weeks = $item.weeks
        }
    }

    if ($item.type -eq "week") {
        $deps.weeks += [PSCustomObject]@{
            id      = $id
            lessons = $item.lessons
        }
    }

    if ($item.type -eq "lesson") {
        $deps.lessons += [PSCustomObject]@{
            id         = $id
            references = $item.references
        }
    }
}

# Check missing dependencies
foreach ($group in $deps.Values) {
    foreach ($entry in $group) {
        foreach ($ref in ($entry | Get-Member -MemberType NoteProperty | Where-Object { $_.Name -ne "id" })) {
            $vals = $entry.$($ref.Name)
            if ($vals -is [System.Collections.IEnumerable]) {
                foreach ($v in $vals) {
                    if ($v -and -not $map.ContainsKey($v)) {
                        $deps.missing += "$($entry.id) → missing: $v"
                    }
                }
            }
        }
    }
}

$path = Join-Path $CurriculumPath "dependency-map.json"
$deps | ConvertTo-Json -Depth 20 | Set-Content -Encoding UTF8 -Path $path

Write-Host "Dependency map written to $path" -ForegroundColor Green
