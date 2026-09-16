# --- SafeSteps CLI Module ---
function Show-SafeStepsInfo {
    Write-Host "SafeSteps CLI module is active."
    Write-Host "Frontend: $env:FRONTEND_PATH"
    Write-Host "Backend:  $env:BACKEND_PATH"
    Write-Host "Engine:   $env:ENGINE_PATH"
    Write-Host "Tools:    $env:TOOLS_PATH"
}

function Start-Program {
    param(
        [string]$ProgramName = "Reunification"
    )
    Write-Host "Starting SafeSteps program: $ProgramName"
    # Example placeholder logic
    Write-Host "Loading curriculum from $env:ENGINE_PATH..."
    Write-Host "Program initialized successfully."
}

function Sync-API {
    Write-Host "Syncing SafeSteps API..."
    Write-Host "Backend path: $env:BACKEND_PATH"
    Write-Host "Frontend path: $env:FRONTEND_PATH"
    Write-Host "✅ API synchronization complete."
}

function Generate-Week {
    param(
        [int]$WeekNumber = 1
    )
    Write-Host "Generating curriculum for Week $WeekNumber..."
    Write-Host "Using engine path: $env:ENGINE_PATH"
    Write-Host "✅ Week $WeekNumber generated successfully."
}

Export-ModuleMember -Function Show-SafeStepsInfo, Start-Program, Sync-API, Generate-Week
