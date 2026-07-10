$supabaseUrl = "<https://yzxotxbwgxnxemkzigse.supabase.co>"
$anonKey = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eG90eGJ3Z3hueGVta3ppZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjcyMDMsImV4cCI6MjA5NzQ0MzIwM30.HnxyBE-mCACCp0IEzb8jUVGou2Fsgax238t7K88Xb8k>"
$bucket = "challenges"

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
