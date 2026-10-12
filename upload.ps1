$supabaseUrl = $env:SUPABASE_URL
$anonKey = $env:SUPABASE_ANON_KEY
$bucket = "challenges"

if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($anonKey)) {
    throw "Set SUPABASE_URL and SUPABASE_ANON_KEY in your local environment before running upload.ps1."
}

$files = Get-ChildItem -Recurse -File -Filter *.json -Path ".\Challenges"

foreach ($file in $files) {
    $localPath = $file.FullName

    # Build relative path
    $relative = $file.FullName.Substring((Get-Location).Path.Length + 1)

    # Convert Windows backslashes to forward slashes
    $relative = $relative -replace "\\", "/"

    # URL-encode spaces
    $relative = $relative -replace " ", "%20"

    # Build remote URL
    $url = "$supabaseUrl/storage/v1/object/$bucket/$relative"

    Write-Host "Uploading: $relative"

    $bytes = [System.IO.File]::ReadAllBytes($localPath)

    $response = Invoke-WebRequest `
        -Uri $url `
        -Method Put `
        -Headers @{ 
            "Authorization" = "Bearer $anonKey"; 
            "Content-Type" = "application/json" 
        } `
        -Body $bytes

    Write-Host "Status: $($response.StatusCode)"
}
