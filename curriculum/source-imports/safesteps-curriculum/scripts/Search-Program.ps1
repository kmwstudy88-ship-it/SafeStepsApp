param(
    [Parameter(Mandatory = $true)]
    [string]$Query
)

Write-Host "=== SAFE STEPS — SEARCH ENGINE v4 ==="
Write-Host "Query: $Query"
Write-Host ""

# ROOT PATHS
$Root = "C:\Users\SAFES\safesteps\safesteps-curriculum"
$ProgramsRoot = Join-Path $Root "programs"
$LessonsRoot = Join-Path $Root "lessons"

# IMPORTANT: DO NOT USE $Matches (PowerShell internal variable)
$Results = @()

# SEARCH PROGRAMS
$ProgramFolders = Get-ChildItem $ProgramsRoot -Directory -ErrorAction SilentlyContinue

foreach ($Program in $ProgramFolders) {
    $ProgramFiles = Get-ChildItem -Path $Program.FullName -Recurse -File -ErrorAction SilentlyContinue

    foreach ($File in $ProgramFiles) {
        $content = Get-Content $File.FullName -Raw
        if ($File.Name -match $Query -or $content -match $Query) {
            $Results += [PSCustomObject]@{
                Type    = "Program"
                Program = $Program.Name
                File    = $File.Name
                Path    = $File.FullName
            }
        }
    }
}

# SEARCH LESSON LIBRARY
$LessonFiles = Get-ChildItem -Path $LessonsRoot -Recurse -File -ErrorAction SilentlyContinue

foreach ($File in $LessonFiles) {
    $content = Get-Content $File.FullName -Raw
    if ($File.Name -match $Query -or $content -match $Query) {
        $Results += [PSCustomObject]@{
            Type    = "Lesson"
            Program = "-"
            File    = $File.Name
            Path    = $File.FullName
        }
    }
}

# OUTPUT RESULTS
if ($Results.Count -eq 0) {
    Write-Host "No matches found."
    exit
}

Write-Host "Matches found:`n"
$Results | Format-Table -AutoSize

