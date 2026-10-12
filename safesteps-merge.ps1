param(
    [Parameter(Mandatory=$true)]
    [string]$BaseVersion,

    [Parameter(Mandatory=$true)]
    [string]$MergeVersion,

    [Parameter(Mandatory=$true)]
    [string]$OutputName
)

$root = "C:\SafeSteps\versions"
$basePath  = Join-Path $root $BaseVersion
$mergePath = Join-Path $root $MergeVersion

if (-not (Test-Path $basePath))  { Write-Host "Base version not found." -ForegroundColor Red; exit }
if (-not (Test-Path $mergePath)) { Write-Host "Merge version not found." -ForegroundColor Red; exit }

$mergeRoot = "C:\SafeSteps\merged"
if (-not (Test-Path $mergeRoot)) { New-Item -ItemType Directory -Path $mergeRoot | Out-Null }

$outPath = Join-Path $mergeRoot $OutputName
New-Item -ItemType Directory -Path $outPath | Out-Null

$baseCurr  = "$basePath\curriculum"
$mergeCurr = "$mergePath\curriculum"
$outCurr   = "$outPath\curriculum"

Copy-Item -Recurse -Path $baseCurr -Destination $outCurr -Force

Get-ChildItem -Recurse $mergeCurr | ForEach-Object {
    $rel = $_.FullName.Replace($mergeCurr, "")
    $dest = Join-Path $outCurr $rel

    if (-not (Test-Path $dest)) {
        Copy-Item -Path $_.FullName -Destination $dest -Force
    } else {
        $a = Get-Content $dest -Raw
        $b = Get-Content $_.FullName -Raw
        if ($a -ne $b) {
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

Write-Host "Merged curriculum created at: $outPath" -ForegroundColor Green
