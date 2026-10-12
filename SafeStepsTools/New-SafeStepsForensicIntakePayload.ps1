# Requires -Version 7.0

[CmdletBinding()]
param(
    [string]$AppFolder = "C:\Users\SAFES\SafeStepsApp",

    [string]$OutputFile = "active_payload.json",

    [string]$TranscriptText,

    [ValidateSet("child_emotional_shielding", "secure_perimeter_established")]
    [string]$Metric = "child_emotional_shielding",

    [switch]$Interactive,

    [switch]$AllowFallbackTranscript
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $AppFolder)) {
    New-Item -ItemType Directory -Path $AppFolder -Force | Out-Null
}

if ($Interactive) {
    Clear-Host
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "  SAFESTEPS FORENSIC ENGINE - INTERACTIVE INTAKE WORKSTATION v2026   " -ForegroundColor Black -BackgroundColor Cyan
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "Loading Active Forensic Taxonomy modules..." -ForegroundColor Gray

    Write-Host "`n[STEP 1: TRANSCRIPT RECORDING]" -ForegroundColor Yellow
    $TranscriptText = Read-Host -Prompt "Enter literal parent transcript quote from 'The Story Behind the Shout' worksheet"

    Write-Host "`n[STEP 2: CHECKED METRIC ENTRY]" -ForegroundColor Yellow
    Write-Host "Select observed indicator metric from options below:" -ForegroundColor Gray
    Write-Host "1) child_emotional_shielding"
    Write-Host "2) secure_perimeter_established"
    $MetricChoice = Read-Host -Prompt "Enter selection index (1 or 2)"

    if ($MetricChoice -eq "2") {
        $Metric = "secure_perimeter_established"
    }
    else {
        $Metric = "child_emotional_shielding"
    }
}

if ([string]::IsNullOrWhiteSpace($TranscriptText)) {
    if (-not $AllowFallbackTranscript) {
        throw "TranscriptText is required. Pass -TranscriptText, use -Interactive, or pass -AllowFallbackTranscript for the built-in test transcript."
    }

    $TranscriptText = "Parent: 'When he started screaming and throwing the blocks, my initial thought was that he was just being defiant to push my buttons because I am so exhausted. But then I stopped and realized he is not trying to make my night hard - he is terrified because this temporary room does not feel like home and he does not know if we are safe here yet.'"
}

$PayloadFilePath = if ([System.IO.Path]::IsPathRooted($OutputFile)) {
    $OutputFile
}
else {
    Join-Path $AppFolder $OutputFile
}

$FinalPayload = [ordered]@{
    SessionID            = "SESS-M755-" + [guid]::NewGuid().ToString().Substring(0, 8).ToUpper()
    Timestamp            = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    ActiveModuleID       = 755
    ActiveModuleTitle    = "Trauma-Informed Parenting Principles"
    SecondaryModuleID    = 760
    SecondaryModuleTitle = "Understanding Behaviour as Communication"
    CheckedMetrics       = @($Metric)
    TranscriptText       = $TranscriptText
}

$JsonOutput = $FinalPayload | ConvertTo-Json -Depth 5
$JsonOutput | Out-File -FilePath $PayloadFilePath -Encoding utf8

$StreamBytes = [System.Text.Encoding]::UTF8.GetBytes($JsonOutput)
$Hasher = [System.Security.Cryptography.SHA256]::Create()
$HashBytes = $Hasher.ComputeHash($StreamBytes)
$Signature = [System.BitConverter]::ToString($HashBytes).Replace("-", "").Substring(0, 16)

$Result = [ordered]@{
    PayloadPath = $PayloadFilePath
    SessionID   = $FinalPayload.SessionID
    SessionLock = "FS-SIG-$Signature"
}

if ($Interactive) {
    Write-Host "`n=====================================================================" -ForegroundColor Cyan
    Write-Host "FORENSIC PAYLOAD GENERATED & ANCHORED" -ForegroundColor Green
    Write-Host "Target Path : $PayloadFilePath" -ForegroundColor Gray
    Write-Host "Session Lock: FS-SIG-$Signature" -ForegroundColor Green
    Write-Host "=====================================================================" -ForegroundColor Cyan
}
else {
    [PSCustomObject]$Result
}
