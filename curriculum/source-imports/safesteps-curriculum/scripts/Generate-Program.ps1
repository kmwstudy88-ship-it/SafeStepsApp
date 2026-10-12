# --- SafeSteps Production Program Builder ---
# Version: 1.3 (June 2026)
# Author: SafeSteps Project
# Description: Builds a SafeSteps program from a master index containing multiple topic objects.

param(
    [string]$ProgramName     = "Custom Program",
    [string]$MasterIndexPath = "C:\Users\SAFES\SafeStepsProject\safesteps-curriculum\master-index.json",
    [int]$HoursPerModule     = 6
)

Import-Module "C:\Users\SAFES\SafeStepsProject\SafeStepsTools\SafeStepsCLI.psm1" -Force

try {
    Write-Host "Building SafeSteps program: $ProgramName"

    # Validate Master Index
    if (-not (Test-Path $MasterIndexPath)) {
        Write-Warning "Master Index not found at $MasterIndexPath"
        return
    }

    # Load JSON
    $masterIndex = Get-Content -Path $MasterIndexPath -Raw | ConvertFrom-Json

    # Handle array of topic objects
    if ($masterIndex -is [System.Collections.IEnumerable]) {
        $topics = $masterIndex
    } else {
        $topics = @($masterIndex)
    }

    # Flatten all modules from each topic
    $modules = @()
    foreach ($topic in $topics) {
        if ($topic.modules) {
            foreach ($m in $topic.modules) {
                $modules += $m
            }
        }
    }

    if (-not $modules -or $modules.Count -eq 0) {
        Write-Warning "No modules found inside topic objects."
        return
    }

    Write-Host "Detected module count: $($modules.Count)"

    # Build course objects from modules
    $courses = @()
    foreach ($module in $modules) {
        $moduleId    = $module.id
        $moduleTitle = if ($module.title) { $module.title } else { $moduleId }
        $courses += [ordered]@{
            CourseName   = $moduleTitle
            ModuleID     = $moduleId
            DurationHrs  = $HoursPerModule
            Modules      = @(
                "Introduction to $moduleTitle",
                "Core Skills and Practice",
                "Application in Family Context",
                "Reflection and Assessment"
            )
            Status       = "Generated"
            Timestamp    = (Get-Date)
        }
    }

    # Generate program and sync data
    $programJson = Start-Program -ProgramName $ProgramName | ConvertFrom-Json
    $syncJson    = Sync-API | ConvertFrom-Json

    # Build final payload
    $programPayload = [ordered]@{
        Program     = $programJson
        Sync        = $syncJson
        ModuleCount = $modules.Count
        Courses     = $courses
        TotalHours  = ($courses.Count * $HoursPerModule)
        SourceIndex = $MasterIndexPath
        Timestamp   = (Get-Date)
    }

    # Output JSON
    $apiJson = $programPayload | ConvertTo-Json -Depth 6
    $apiPath = "C:\Users\SAFES\SafeStepsProject\safesteps\custom-program.json"
    $apiJson | Out-File -FilePath $apiPath -Encoding UTF8

    # Log success
    $logPath = "C:\Users\SAFES\SafeStepsProject\SafeStepsTools\SafeSteps.log"
    "[$(Get-Date)] Program '$ProgramName' built successfully. Output: $apiPath" | Out-File $logPath -Append

    Write-Host "✅ SafeSteps program generated successfully."
    Write-Host "Output saved to: $apiPath"
}
catch {
    $errorMsg = "Program build failed: $($_.Exception.Message)"
    Write-Warning $errorMsg
    $logPath = "C:\Users\SAFES\SafeStepsProject\SafeStepsTools\SafeSteps.log"
    "[$(Get-Date)] ERROR: $errorMsg" | Out-File $logPath -Append
}
