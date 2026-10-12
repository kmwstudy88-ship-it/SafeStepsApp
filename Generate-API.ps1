# --- SafeSteps API Generator (Production Ready) ---

param(
    [string[]]$ProgramNames = @("Reunification", "Home Again", "SafeBridge"),
    [int]$TotalWeeks = 96
)

# Import SafeSteps CLI module
Import-Module "C:\Users\SAFES\SafeStepsProject\SafeStepsTools\SafeStepsCLI.psm1" -Force

# Initialize container for all programs
$allPrograms = @()

foreach ($program in $ProgramNames) {
    Write-Host "Starting SafeSteps program: $program"
    $programJson = ss-start -ProgramName $program | ConvertFrom-Json
    $syncJson    = ss-sync | ConvertFrom-Json

    # Generate all weeks for this program
    $weeks = @()
    for ($i = 1; $i -le $TotalWeeks; $i++) {
        Write-Host "Generating curriculum for Week $i..."
        $weekJson = ss-week -WeekNumber $i | ConvertFrom-Json
        $weeks += $weekJson
    }

    # Combine program data
    $payload = [ordered]@{
        Program   = $programJson
        Sync      = $syncJson
        Weeks     = $weeks
        Timestamp = (Get-Date)
    }

    $allPrograms += $payload
}

# Combine all programs into one API payload
$apiPayload = [ordered]@{
    Programs  = $allPrograms
    Generated = (Get-Date)
}

# Convert to JSON and save
$apiJson = $apiPayload | ConvertTo-Json -Depth 6
$apiPath = "C:\Users\SAFES\SafeStepsProject\safesteps\api-output.json"
$apiJson | Out-File -FilePath $apiPath -Encoding UTF8

Write-Host "✅ Full SafeSteps curriculum generated successfully."
Write-Host "Output saved to: $apiPath"
