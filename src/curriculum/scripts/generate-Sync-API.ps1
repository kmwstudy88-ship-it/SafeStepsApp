# ============================================================
# Sync-API.ps1
# Pushes the generated API to Firebase (or any backend)
# ============================================================

Write-Host "Syncing SafeSteps API..."

# -----------------------------
# 1. Load API file
# -----------------------------
$apiPath = Join-Path $PSScriptRoot "..\out\api.json"

if (-not (Test-Path $apiPath)) {
    Write-Host "ERROR: API file not found at $apiPath"
    exit 1
}

$apiJson = Get-Content -Path $apiPath -Raw

# -----------------------------
# 2. Firebase URL
# -----------------------------
$firebaseUrl = https://rCgCdxOETyt8OooHx7Q3Szbp54xVwOzC6Dcxaeta

# -----------------------------
# 3. Push to Firebase
# -----------------------------
try {
    $response = Invoke-RestMethod -Uri $firebaseUrl -Method Put -Body $apiJson -ContentType "application/json"
    Write-Host "API synced successfully."
}
catch {
    Write-Host "ERROR syncing API:"
    Write-Host $_.Exception.Message
    exit 1
}
