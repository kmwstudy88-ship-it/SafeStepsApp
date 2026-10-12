function Write-SafeStepsLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $logDir = Join-Path $PSScriptRoot "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir | Out-Null
    }

    $logFile = Join-Path $logDir ("safesteps-{0:yyyyMMdd}.log" -f (Get-Date))
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp [$Level] $Message" | Add-Content -Path $logFile
}

function Read-SafeStepsConfig {
    $configPath = Join-Path $PSScriptRoot "safesteps-config.json"
    if (-not (Test-Path $configPath)) {
        throw "SafeSteps config file not found at $configPath"
    }
    Get-Content $configPath -Raw | ConvertFrom-Json
}

function Test-SafeStepsCurriculumRoot {
    $config = Read-SafeStepsConfig
    $root = $config.CurriculumRoot
    if (-not (Test-Path $root)) {
        throw "Curriculum root path not found: $root"
    }
    return $root
}

function Get-SafeStepsCurriculumPaths {
    # Hard-coded SafeSteps root for reliability
    $root = "C:\Users\SAFES\SafeStepsApp\curriculum"

    if (-not (Test-Path $root)) {
        throw "SafeSteps curriculum root not found at: $root"
    }

    return @{
        Root      = $root
        Programs  = Join-Path $root "programs"
        Stages    = Join-Path $root "stages"
        Weeks     = Join-Path $root "weeks"
        Lessons   = Join-Path $root "lessons"
    }
}


Export-ModuleMember -Function *-SafeSteps*
