# =====================================================================
# SAFE STEPS — WEB DOCUMENTATION GENERATOR
# Builds a full HTML documentation site for the curriculum
# =====================================================================

$Root          = Get-Location
$ProgramsPath  = Join-Path $Root "programs"
$Reunification = Join-Path $ProgramsPath "reunification-24m"
$HomeAgain     = Join-Path $ProgramsPath "home-again-12m"
$Dist          = Join-Path $Root "webdocs"

# Ensure output folder exists
if (Test-Path $Dist) { Remove-Item $Dist -Recurse -Force }
New-Item -ItemType Directory -Path $Dist | Out-Null

Write-Host "`n=== SAFE STEPS — WEB DOCS GENERATOR ==="
Write-Host "Output folder: $Dist`n"

# ---------------------------------------------------------------------
# SAFE JSON LOADER
# ---------------------------------------------------------------------

function Load-JsonSafe {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return $null }

    try {
        return Get-Content $Path -Raw | ConvertFrom-Json
    }
    catch {
        return $null
    }
}

# ---------------------------------------------------------------------
# HTML HELPERS
# ---------------------------------------------------------------------

function Write-Page {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Body
    )

    $Html = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>$Title</title>
<style>
body { font-family: Arial; margin: 40px; }
h1, h2, h3, h4 { color: #333; }
.sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 260px; background: #f4f4f4; padding: 20px;
    overflow-y: auto; border-right: 1px solid #ddd;
}
.content { margin-left: 300px; padding: 20px; }
a { text-decoration: none; color: #0066cc; }
a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="sidebar">
<h2>SafeSteps Docs</h2>
<a href="index.html">Home</a><br><br>
$Global:Sidebar
</div>
<div class="content">
$Body
</div>
</body>
</html>
"@

    $Html | Out-File $Path -Encoding utf8
}

# ---------------------------------------------------------------------
# BUILD SIDEBAR
# ---------------------------------------------------------------------

$Sidebar = @()
$Sidebar += "<h3>Reunification (24m)</h3>"

$Stages = Get-ChildItem $Reunification -Directory

foreach ($Stage in $Stages) {
    $StageSlug = $Stage.Name
    $Sidebar += "<b>$StageSlug</b><br>"

    $Weeks = Get-ChildItem $Stage.FullName -Directory
    foreach ($Week in $Weeks) {
        $WeekSlug = $Week.Name
        $Sidebar += "<a href='$StageSlug-$WeekSlug.html'>• $WeekSlug</a><br>"
    }

    $Sidebar += "<br>"
}

$Sidebar += "<h3>Home Again (12m)</h3>"

$Phases = Get-ChildItem $HomeAgain -Directory

foreach ($Phase in $Phases) {
    $PhaseSlug = $Phase.Name
    $Sidebar += "<a href='$PhaseSlug.html'>$PhaseSlug</a><br>"
}

$Global:Sidebar = $Sidebar -join "`n"

# ---------------------------------------------------------------------
# INDEX PAGE
# ---------------------------------------------------------------------

Write-Page -Path (Join-Path $Dist "index.html") `
    -Title "SafeSteps Curriculum Documentation" `
    -Body "<h1>SafeSteps Curriculum Documentation</h1><p>Select a stage or week from the sidebar.</p>"

# ---------------------------------------------------------------------
# REUNIFICATION PAGES
# ---------------------------------------------------------------------

foreach ($Stage in $Stages) {

    $StageSlug = $Stage.Name
    $Weeks = Get-ChildItem $Stage.FullName -Directory

    foreach ($Week in $Weeks) {

        $WeekSlug = $Week.Name
        $WeekJson = Load-JsonSafe (Join-Path $Week.FullName "week.json")

        $Tasks      = Load-JsonSafe (Join-Path $Week.FullName "tasks.json")
        $Milestones = Load-JsonSafe (Join-Path $Week.FullName "milestones.json")
        $Evidence   = Load-JsonSafe (Join-Path $Week.FullName "evidence.json")
        $Daily      = Load-JsonSafe (Join-Path $Week.FullName "daily-tasks.json")

        $Body = @()
        $Body += "<h1>$StageSlug / $WeekSlug</h1>"
        $Body += "<p><b>Title:</b> $($WeekJson.title)</p>"
        $Body += "<p><b>Focus:</b> $($WeekJson.focus)</p>"

        $Body += "<h2>Tasks</h2>"
        foreach ($T in $Tasks) { $Body += "<p>• $T</p>" }

        $Body += "<h2>Milestones</h2>"
        foreach ($M in $Milestones) { $Body += "<p>• $M</p>" }

        $Body += "<h2>Evidence</h2>"
        foreach ($E in $Evidence) { $Body += "<p>• $E</p>" }

        $Body += "<h2>Daily Tasks</h2>"
        foreach ($D in $Daily) { $Body += "<p>• $D</p>" }

        Write-Page -Path (Join-Path $Dist "$StageSlug-$WeekSlug.html") `
            -Title "$StageSlug $WeekSlug" `
            -Body ($Body -join "`n")
    }
}

# ---------------------------------------------------------------------
# HOME AGAIN PAGES
# ---------------------------------------------------------------------

foreach ($Phase in $Phases) {

    $PhaseSlug = $Phase.Name
    $PhaseJson = Load-JsonSafe (Join-Path $Phase.FullName "phase.json")

    $Tasks      = Load-JsonSafe (Join-Path $Phase.FullName "tasks.json")
    $Milestones = Load-JsonSafe (Join-Path $Phase.FullName "milestones.json")
    $Evidence   = Load-JsonSafe (Join-Path $Phase.FullName "evidence.json")
    $Daily      = Load-JsonSafe (Join-Path $Phase.FullName "daily-tasks.json")

    $Body = @()
    $Body += "<h1>$PhaseSlug</h1>"
    $Body += "<p><b>Title:</b> $($PhaseJson.title)</p>"
    $Body += "<p><b>Description:</b> $($PhaseJson.description)</p>"

    $Body += "<h2>Tasks</h2>"
    foreach ($T in $Tasks) { $Body += "<p>• $T</p>" }

    $Body += "<h2>Milestones</h2>"
    foreach ($M in $Milestones) { $Body += "<p>• $M</p>" }

    $Body += "<h2>Evidence</h2>"
    foreach ($E in $Evidence) { $Body += "<p>• $E</p>" }

    $Body += "<h2>Daily Tasks</h2>"
    foreach ($D in $Daily) { $Body += "<p>• $D</p>" }

    Write-Page -Path (Join-Path $Dist "$PhaseSlug.html") `
        -Title "$PhaseSlug" `
        -Body ($Body -join "`n")
}

Write-Host "Web documentation generated successfully."
Write-Host "Open: $Dist\index.html`n"
