param(
    [string]$WebhookUrl,
    [string]$Title,
    [string]$Message,
    [string]$Status = "info",
    [string]$Stage = $null
)

pwsh -File "C:\Users\SAFES\safesteps-curriculum\scripts\Send-Notification.ps1" `
    -WebhookUrl $WebhookUrl `
    -Title $Title `
    -Message $Message `
    -Status $Status `
    -Stage $Stage
