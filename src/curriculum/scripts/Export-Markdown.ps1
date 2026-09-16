param(
    [string]$LessonsDir = ".\lessons",
    [string]$OutputDir = ".\export\markdown"
)

Write-Host "=== Export-Markdown.ps1 ==="

function Load-JsonSafe {
    param([string]$Path)
    try { return (Get-Content $Path -Raw | ConvertFrom-Json) }
    catch { return $null }
}

foreach ($lf in Get-ChildItem $LessonsDir -Filter *.json) {

    $lesson = Load-JsonSafe $lf.FullName
    if (-not $lesson -or -not $lesson.id) { continue }

    if (-not $lesson.printable_pack) {
        Write-Warning "[SKIP] No printable pack -> $($lesson.id)"
        continue
    }

    $mdPath = Join-Path $OutputDir "$($lesson.id).md"

    Write-Host "[MD] Exporting -> $mdPath"

    $content = @"
# SafeSteps Printable Pack  
## $($lesson.id)

$($lesson.printable_pack)
"@

    Set-Content -Path $mdPath -Value $content -Encoding UTF8
}

Write-Host "`nMarkdown export complete."
