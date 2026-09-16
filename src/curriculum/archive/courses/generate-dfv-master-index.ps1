# Generate DFV Master Index

$parentIndexPath = "dfv-parent-index.json"
$pwuvIndexPath   = "dfv-pwuv-index.json"
$peerIndexPath   = "dfv-peer-mentor-index.json"

# Load each index file
$parentIndex = Get-Content $parentIndexPath | ConvertFrom-Json
$pwuvIndex   = Get-Content $pwuvIndexPath   | ConvertFrom-Json
$peerIndex   = Get-Content $peerIndexPath   | ConvertFrom-Json

# Combine into one master list
$master = @()
$master += $parentIndex
$master += $pwuvIndex
$master += $peerIndex

# Output master index
$master | ConvertTo-Json -Depth 10 | Out-File "dfv-master-index.json" -Encoding UTF8

Write-Host "DFV Master Index created."
