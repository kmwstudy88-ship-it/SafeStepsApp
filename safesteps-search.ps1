param(
    [string]$Query,
    [string]$Type = "all"   # all | courses | topics | lessons
)

$toolsPath = Join-Path $PSScriptRoot "safesteps-tools.psm1"
Import-Module $toolsPath -Force

$paths = Get-SafeStepsCurriculumPaths
Write-SafeStepsLog -Message "Running Curriculum Search: Query='$Query' Type='$Type'" -Level "INFO"

# Load libraries
$librariesRoot = Join-Path $paths.Root "libraries"

function Load-Library($name) {
    $file = Join-Path $librariesRoot $name
    if (Test-Path $file) {
        return (Get-Content $file -Raw | ConvertFrom-Json)
    }
    return @()
}

$courses = Load-Library "courses-library.json"
$topics  = Load-Library "topics-library.json"
$lessons = Load-Library "lessons-library.json"

# Helper: case-insensitive contains
function Match-Text {
    param($text, $query)
    if ($null -eq $text) { return $false }
    return ($text.ToLower().Contains($query.ToLower()))
}

$results = @()

# -------------------------------
# SEARCH COURSES
# -------------------------------
if ($Type -eq "all" -or $Type -eq "courses") {
    foreach ($c in $courses) {
        if (Match-Text $c.name $Query -or Match-Text $c.description $Query) {
            $results += [PSCustomObject]@{
                type  = "course"
                id    = $c.id
                name  = $c.name
                match = $c.description
            }
        }
    }
}

# -------------------------------
# SEARCH TOPICS
# -------------------------------
if ($Type -eq "all" -or $Type -eq "topics") {
    foreach ($t in $topics) {
        if (Match-Text $t.name $Query -or Match-Text $t.description $Query) {
            $results += [PSCustomObject]@{
                type  = "topic"
                id    = $t.id
                name  = $t.name
                match = $t.description
            }
        }
    }
}

# -------------------------------
# SEARCH LESSONS
# -------------------------------
if ($Type -eq "all" -or $Type -eq "lessons") {
    foreach ($l in $lessons) {
        if (Match-Text $l.title $Query -or Match-Text $l.subject $Query) {
            $results += [PSCustomObject]@{
                type    = "lesson"
                id      = $l.id
                title   = $l.title
                subject = $l.subject
                weekId  = $l.weekId
                stageId = $l.stageId
                programId = $l.programId
            }
        }
    }
}

# -------------------------------
# OUTPUT RESULTS
# -------------------------------
Write-Host "=== Search Results ===" -ForegroundColor Cyan
Write-Host "Query: $Query" -ForegroundColor Yellow
Write-Host "Matches: $($results.Count)" -ForegroundColor Green

$results | ConvertTo-Json -Depth 10
