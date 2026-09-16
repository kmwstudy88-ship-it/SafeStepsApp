param(
    [string]$Version = "v1.0.0",
    [switch]$Deploy,
    [string]$DatabaseUrl,
    [string]$ApiKey,
    [string]$WebhookUrl
)
Write-Host "`n=== PIPELINE COMPLETE ($Version) ==="
