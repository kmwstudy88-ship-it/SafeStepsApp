param(
    [string]$MasterPath = ".\master-index.json",
    [string]$TopicsDir = ".\topics"
)

Write-Host "=== Split-Master.ps1 (Topic Index Splitter) ==="

# Ensure master file exists
if (-not (Test-Path $MasterPath)) {
    Write-Error ("Master file not found: {0}" -f $MasterPath)
    exit 1
}

# Ensure output directory exists
New-Item -ItemType Directory -Path $TopicsDir -ErrorAction SilentlyContinue | Out-Null

# Load JSON safely
try {
    $raw = Get-Content $MasterPath -Raw
    $topics = $raw | ConvertFrom-Json
}
catch {
    $err = $_ | Out-String
    Write-Error ("Failed to parse JSON from {0}: {1}" -f $MasterPath, $err)
    exit 1
}

# Validate structure
if (-not ($topics -is [System.Collections.IEnumerable])) {
    Write-Error "Master file must contain an array of topics."
    exit 1
}

# Split topics
foreach ($topic in $topics) {

    if (-not $topic.topicId) {
        Write-Warning "Skipping topic with no 'topicId'."
        continue
    }

    $topicPath = Join-Path $TopicsDir "$($topic.topicId).json"
    $topic | ConvertTo-Json -Depth 20 | Set-Content $topicPath -Encoding UTF8

    Write-Host ("Topic → {0}" -f $topicPath)
}

Write-Host "Topic index split complete."
