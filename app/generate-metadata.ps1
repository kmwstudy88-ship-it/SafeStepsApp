# ============================================
# SafeSteps Automatic Metadata Generator
# ============================================

Write-Host "Generating SafeSteps metadata..."

$root = "SafeStepsLibrary\Courses"

$items = Get-ChildItem -Recurse -Directory $root

foreach ($item in $items) {

    $metaPath = Join-Path $item.FullName "metadata.json"

    # Create metadata.json if missing
    if (-not (Test-Path $metaPath)) {
        Write-Host "Creating metadata: $metaPath"

        $metadata = [ordered]@{
            id          = [guid]::NewGuid().ToString()
            name        = $item.Name
            created     = (Get-Date).ToString("yyyy-MM-dd")
            updated     = (Get-Date).ToString("yyyy-MM-dd")
            description = ""
            tags        = @()
        }

        $metadata | ConvertTo-Json -Depth 10 | Set-Content $metaPath
        continue
    }

    # Update existing metadata
    try {
        $json = Get-Content $metaPath -Raw | ConvertFrom-Json
    }
    catch {
        Write-Host "Invalid metadata: $metaPath"
        continue
    }

    $updated = $false

    if (-not $json.id) {
        $json.id = [guid]::NewGuid().ToString()
        $updated = $true
    }

    if (-not $json.name) {
        $json.name = $item.Name
        $updated = $true
    }

    if (-not $json.updated) {
        $json.updated = (Get-Date).ToString("yyyy-MM-dd")
        $updated = $true
    }

    if ($updated) {
        Write-Host "Updating metadata: $metaPath"
        $json | ConvertTo-Json -Depth 10 | Set-Content $metaPath
    }
}

Write-Host "Metadata generation complete."
