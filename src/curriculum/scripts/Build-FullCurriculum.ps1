Write-Host "=== Build-FullCurriculum.ps1 ==="

# ------------------------------
# 1. Generate Section Content
# ------------------------------
Write-Host "`n[1/10] Generating base section content..."
pwsh -File .\scripts\Generate-SectionContent.ps1

Write-Host "`n[2/10] Generating trauma overlays..."
pwsh -File .\scripts\Generate-SectionContent_Trauma.ps1

Write-Host "`n[3/10] Generating safety overlays..."
pwsh -File .\scripts\Generate-SectionContent_Safety.ps1

Write-Host "`n[4/10] Generating age + fatherhood variants..."
pwsh -File .\scripts\Generate-SectionContent_AgeFather.ps1

# ------------------------------
# 2. Simplified Parent Versions
# ------------------------------
Write-Host "`n[5/10] Generating simplified parent versions..."
pwsh -File .\scripts\Generate-SimplifiedParentVersions.ps1

# ------------------------------
# 3. Generate Lesson Content
# ------------------------------
Write-Host "`n[6/10] Generating lesson content..."
pwsh -File .\scripts\Generate-LessonContent.ps1

# ------------------------------
# 4. Link Curriculum
# ------------------------------
Write-Host "`n[7/10] Linking curriculum..."
pwsh -File .\scripts\Generate-CurriculumLinks.ps1

# ------------------------------
# 5. Printable Packs
# ------------------------------
Write-Host "`n[8/10] Generating printable packs..."
pwsh -File .\scripts\Generate-PrintablePacks.ps1

# ------------------------------
# 6. Export Pipeline
# ------------------------------
Write-Host "`n[9/10] Exporting Markdown..."
pwsh -File .\scripts\Export-Markdown.ps1

Write-Host "`n[10/10] Exporting HTML..."
pwsh -File .\scripts\Export-HTML.ps1

Write-Host "`n[10/10] Exporting PDF..."
pwsh -File .\scripts\Export-PDF.ps1

Write-Host "`n=== FULL CURRICULUM BUILD COMPLETE ==="
