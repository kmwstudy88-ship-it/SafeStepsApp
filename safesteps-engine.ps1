param(
    [string]$Command = "",
    [string]$Arg1 = "",
    [string]$Arg2 = ""
)

$root = "C:\Users\SAFES\SafeStepsApp"

Write-Host "Running SafeSteps command: $Command"

switch ($Command.ToLower()) {

    "bulk" {
        powershell -ExecutionPolicy Bypass -File "$root\app\log.ps1" -Message "Bulk-add started"
        powershell -ExecutionPolicy Bypass -File "$root\app\validate-safesteps.ps1"
        powershell -ExecutionPolicy Bypass -File "$root\app\repair-json.ps1"
        powershell -ExecutionPolicy Bypass -File "$root\app\generate-metadata.ps1"
        powershell -ExecutionPolicy Bypass -File "$root\app\normalize-folders.ps1"
        powershell -ExecutionPolicy Bypass -File "$root\build-safesteps-library.ps1"
        powershell -ExecutionPolicy Bypass -File "$root\app\version-manager.ps1" -Type "patch"
        powershell -ExecutionPolicy Bypass -File "$root\app\log.ps1" -Message "Bulk-add completed"
        break
    }

    "build" {
        powershell -ExecutionPolicy Bypass -File "$root\build-safesteps-library.ps1"
        break
    }

    "curriculum" {
        powershell -ExecutionPolicy Bypass -File "$root\curriculum-engine.ps1"
        break
    }

    default {
        Write-Host ""
        Write-Host "SafeSteps Commands:"
        Write-Host "  safesteps bulk"
        Write-Host "  safesteps build"
        Write-Host "  safesteps curriculum"
        Write-Host ""
    }
}