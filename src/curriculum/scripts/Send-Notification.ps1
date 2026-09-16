param(
    [Parameter(Mandatory = $true)]
    [string]$WebhookUrl,

    [Parameter(Mandatory = $true)]
    [string]$Title,

    [Parameter(Mandatory = $true)]
    [string]$Message,

    [string]$Status = "info",   # info | success | warning | error
    [string]$Stage  = $null
)

# Discord embed colors
$ColorMap = @{
    info    = 3447003
    success = 3066993
    warning = 15105570
    error   = 15158332
}

$Color = $ColorMap[$Status]

if ($Stage) {
    $Message = "**Stage:** $Stage`n`n$Message"
}

$Payload = @{
    content = $null
    embeds = @(
        @{
            title       = $Title
            description = $Message
            color       = $Color
            timestamp   = (Get-Date).ToString("o")
        }
    )
}

$Json = $Payload | ConvertTo-Json -Depth 10

try {
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $Json -ContentType "application/json"
    Write-Host "Discord notification sent: $Status - $Title"
}
catch {
    Write-Host "Failed to send Discord notification:"
    Write-Host $_.Exception.Message
}
