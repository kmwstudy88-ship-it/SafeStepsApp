# FolderSearch.ps1
$root = "C:\Users\SAFES\SafeStepsApp"

Write-Host "Searching SafeSteps project..." -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
Where-Object {
    $_.FullName -notmatch "node_modules" -and
    ($_.Extension -in ".js", ".jsx", ".json", ".md", ".txt")
} |
Select-Object FullName, Extension, Length, LastWriteTime |
Sort-Object FullName |
Format-Table -AutoSize