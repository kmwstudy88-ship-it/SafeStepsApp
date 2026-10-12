# LessonSearch.ps1
# Finds all lesson-related files in SafeSteps (screens, JSON, curriculum, components)

$root = "C:\Users\SAFES\SafeStepsApp"

Write-Host "Searching for LESSON files..." -ForegroundColor Green
Write-Host ""

Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
Where-Object {
    $_.FullName -notmatch "node_modules" -and
    (
        $_.Name -match "lesson" -or
        $_.DirectoryName -match "lesson" -or
        $_.Extension -in ".json", ".js", ".jsx", ".tsx"
    )
} |
Select-Object FullName, Extension, LastWriteTime |
Sort-Object FullName |
Format-Table -AutoSize