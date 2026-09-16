$lessonFolder = "C:\Users\SAFES\safesteps-curriculum\packages\content-courses\full-reunification-24m\v1.0.0\lessons"
$outputFolder = "C:\Users\SAFES\safesteps-curriculum\master-index"

New-Item -ItemType Directory -Force -Path $outputFolder | Out-Null

Get-ChildItem -Path $lessonFolder -Filter *.json | ForEach-Object {

    $file = $_.FullName

    try {
        $json = Get-Content $file -Raw | ConvertFrom-Json
    }
    catch {
        Write-Host "Invalid JSON, skipping: $($_.Name)"
        return
    }

    if (-not $json.title) {
        Write-Host "No title found, skipping: $($_.Name)"
        return
    }

    # Convert title to safe filename
    $safeTitle = $json.title.ToLower() `
        -replace '[^a-z0-9]+' , '-' `
        -replace '-+', '-' `
        -replace '^-','' `
        -replace '-$',''

    $newFilePath = Join-Path $outputFolder "$safeTitle.json"

    # Save the original lesson JSON under the new topic filename
    $json | ConvertTo-Json -Depth 10 | Set-Content $newFilePath -Encoding UTF8

    Write-Host "Saved: $safeTitle.json"
}

Write-Host "DONE - All lessons converted to topic filenames and placed in master index."
