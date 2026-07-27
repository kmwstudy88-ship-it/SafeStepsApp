param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadZip,
  [ValidateSet("Plan", "Apply")]
  [string]$Mode = "Plan",
  [switch]$InstallDependencies,
  [switch]$CopyMigrations
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$WorkRoot = Join-Path $ProjectRoot "_video_integration_work\$Stamp"
$ExtractRoot = Join-Path $WorkRoot "payload"
$BackupRoot = Join-Path $ProjectRoot "_integration_backups\video_$Stamp"
$ReportPath = Join-Path $WorkRoot "file-plan.csv"

if (-not (Test-Path $PayloadZip)) {
  throw "Payload ZIP not found: $PayloadZip"
}

New-Item -ItemType Directory -Force -Path $ExtractRoot | Out-Null
Expand-Archive -LiteralPath $PayloadZip -DestinationPath $ExtractRoot -Force

function Get-Hash([string]$Path) {
  return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
}

$Rows = @()
Get-ChildItem $ExtractRoot -File -Recurse | ForEach-Object {
  $Relative = [System.IO.Path]::GetRelativePath($ExtractRoot, $_.FullName)
  $IsMigration = $Relative -like "supabase\migrations\*"
  $Target = Join-Path $ProjectRoot $Relative
  $SourceHash = Get-Hash $_.FullName

  if (-not (Test-Path $Target)) {
    $Status = "new"
    $TargetHash = ""
  } else {
    $TargetHash = Get-Hash $Target
    $Status = if ($SourceHash -eq $TargetHash) { "identical" } else { "conflict" }
  }

  $Rows += [PSCustomObject]@{
    relative_path = $Relative
    status = $Status
    migration = $IsMigration
    source_sha256 = $SourceHash
    target_sha256 = $TargetHash
  }
}

$Rows | Sort-Object relative_path | Export-Csv $ReportPath -NoTypeInformation

Write-Host "New files: $(@($Rows | Where-Object status -eq 'new').Count)"
Write-Host "Identical files: $(@($Rows | Where-Object status -eq 'identical').Count)"
Write-Host "Conflicts: $(@($Rows | Where-Object status -eq 'conflict').Count)"
Write-Host "Plan: $ReportPath"

if ($Mode -eq "Plan") {
  Write-Host "Plan mode complete. No repository files were changed."
  exit 0
}

foreach ($Row in $Rows) {
  if ($Row.status -eq "conflict") {
    Write-Warning "Skipped conflict: $($Row.relative_path)"
    continue
  }
  if ($Row.status -eq "identical") { continue }
  if ($Row.migration -eq "True" -and -not $CopyMigrations) {
    Write-Warning "Skipped migration pending review: $($Row.relative_path)"
    continue
  }

  $Source = Join-Path $ExtractRoot $Row.relative_path
  $Target = Join-Path $ProjectRoot $Row.relative_path
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Target) | Out-Null

  if (Test-Path $Target) {
    $Backup = Join-Path $BackupRoot $Row.relative_path
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Backup) | Out-Null
    Copy-Item $Target $Backup -Force
  }
  Copy-Item $Source $Target -Force
}

if ($InstallDependencies) {
  Push-Location $ProjectRoot
  try {
    npx expo install react-native-webview expo-notifications
  } finally {
    Pop-Location
  }
}

Write-Host "Safe file application complete."
Write-Host "Migrations were copied: $CopyMigrations"
Write-Host "Run: npx tsc --noEmit"
Write-Host "Run: npm test -- --runInBand"
Write-Host "Review migrations before any Supabase database push."
