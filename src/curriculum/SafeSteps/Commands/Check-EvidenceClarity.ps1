. $PSScriptRoot\Get-Timestamp.ps1
. $PSScriptRoot\Get-Timestamp.ps1

function Check-EvidenceClarity {
    param(
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        Write-Warning "File not found"
        return
    }

    # Extract EXIF metadata
    $exif = exiftool $FilePath | ConvertFrom-StringData

    # Extract EXIF timestamp
    $captured = $exif."DateTimeOriginal"

    # Simple clarity check: file size + dimensions
    $size = (Get-Item $FilePath).Length
    $clarity = [math]::Min(($size / 50000), 100)

    return @{
        captured_at = $captured
        clarity_score = [math]::Round($clarity, 0)
    }
}

