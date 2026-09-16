param(
    [string]$WeeksDir = ".\weeks",
    [string]$TopicsDir = ".\topics"
)

Write-Host "=== Split-Weeks.ps1 ==="

if (-not (Test-Path $WeeksDir)) {
    Write-Warning "Weeks directory not found: $WeeksDir. Skipping."
    exit 0
}

New-Item -ItemType Directory -Path $TopicsDir -ErrorAction SilentlyContinue | Out-Null

$weekFiles = Get-ChildItem $WeeksDir -Filter "*.json" -File
if (-not $weekFiles) {
    Write-Warning "No week JSON files found in $WeeksDir."
    exit 0
}

foreach ($file in $weekFiles) {
    Write-Host "Processing: $($file.Name)"

    try {
        $week = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse JSON from ${file.FullName}: $_"
        continue
    }

    if (-not $week.topics) { continue }

    foreach ($topic in $week.topics) {
        if (-not $topic.id) { continue }

        $topicPath = Join-Path $TopicsDir "$($topic.id).json"
        $topic | ConvertTo-Json -Depth 20 | Set-Content $topicPath -Encoding UTF8
        Write-Host "  Topic → $topicPath"
    }
}

Write-Host "Weekly split complete."
