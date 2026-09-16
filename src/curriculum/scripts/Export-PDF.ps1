param(
    [string]$HtmlDir = ".\export\html",
    [string]$OutputDir = ".\export\pdf"
)

Write-Host "=== Export-PDF.ps1 ==="

foreach ($html in Get-ChildItem $HtmlDir -Filter *.html) {

    $pdfPath = Join-Path $OutputDir ($html.BaseName + ".pdf")

    Write-Host "[PDF] Exporting -> $pdfPath"

    # Uses wkhtmltopdf (must be installed locally)
    & wkhtmltopdf $html.FullName $pdfPath
}

Write-Host "`nPDF export complete."
