# CurriculumIndex.ps1
# Builds a full index of all curriculum-related files in SafeSteps

$root = "C:\Users\SAFES\SafeStepsApp"

Write-Host "Indexing SafeSteps Curriculum..." -ForegroundColor Yellow
Write-Host ""

Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
Where-Object {
    $_.FullName -notmatch "node_modules" -and
    (
        $_.Name -match "lesson" -or
        $_.Name -match "week" -or
        $_.Name -match "program" -or
        $_.Name -match "curriculum" -or
        $_.Name -match "module" -or
        $_.Name -match "unit" -or
        $_.DirectoryName -match "lesson" -or
        $_.DirectoryName -match "week" -or
        $_.DirectoryName -match "program" -or
        $_.DirectoryName -match "curriculum" -or
        $_.DirectoryName -match "module" -or
        $_.DirectoryName -match "unit"
    )
} |
Select-Object FullName, Extension, LastWriteTime |
Sort-Object FullName |
Format-Table -AutoSize