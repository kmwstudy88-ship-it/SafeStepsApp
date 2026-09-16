param(
    [string]$MarkdownDir = ".\export\markdown",
    [string]$OutputDir = ".\export\html"
)

Write-Host "=== Export-HTML.ps1 ==="

foreach ($md in Get-ChildItem $MarkdownDir -Filter *.md) {

    $htmlPath = Join-Path $OutputDir ($md.BaseName + ".html")

    Write-Host "[HTML] Rendering -> $htmlPath"

    $body = Get-Content $md.FullName -Raw

    $html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>$($md.BaseName)</title>
<style>
body { font-family: Arial; line-height: 1.6; margin: 40px; }
h1, h2, h3 { color: #333; }
pre { background: #f4f4f4; padding: 10px; }
</style>
</head>
<body>
<pre>
$body
</pre>
</body>
</html>
"@

    Set-Content -Path $htmlPath -Value $html -Encoding UTF8
}

Write-Host "`nHTML export complete."
