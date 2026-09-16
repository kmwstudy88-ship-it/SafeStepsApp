Write-Host "=== Export-AllPDF.ps1 ==="

Write-Host "`n[1/3] Exporting Markdown..."
pwsh -File .\scripts\Export-Markdown.ps1

Write-Host "`n[2/3] Exporting HTML..."
pwsh -File .\scripts\Export-HTML.ps1

Write-Host "`n[3/3] Exporting PDF..."
pwsh -File .\scripts\Export-PDF.ps1

Write-Host "`n=== FULL PDF EXPORT COMPLETE ==="
