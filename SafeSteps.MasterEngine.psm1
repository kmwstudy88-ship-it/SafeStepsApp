# ============================
# SafeSteps Master Engine
# ============================

# Engine Registry
$script:SafeStepsEngineRegistry = @(
    @{ Id = 1;  Name = 'Curriculum Mapping Engine';        Code = 'Mapping';      Stage = 'Core' }
    @{ Id = 2;  Name = 'Auto Generator Engine';            Code = 'AutoGenV1';    Stage = 'Core' }
    @{ Id = 3;  Name = 'Auto Generator Engine v2';         Code = 'AutoGenV2';    Stage = 'Core' }
    @{ Id = 4;  Name = 'Validation Engine';                Code = 'Validation';   Stage = 'Core' }
    @{ Id = 5;  Name = 'Rollback Engine';                  Code = 'Rollback';     Stage = 'Core' }

    @{ Id = 6;  Name = 'Diff Engine';                      Code = 'Diff';         Stage = 'Structure' }
    @{ Id = 7;  Name = 'Snapshot Engine';                  Code = 'Snapshot';     Stage = 'Structure' }
    @{ Id = 8;  Name = 'Sync Engine';                      Code = 'Sync';         Stage = 'Structure' }
    @{ Id = 9;  Name = 'Integrity Engine';                 Code = 'Integrity';    Stage = 'Structure' }
    @{ Id = 10; Name = 'Repair Engine';                    Code = 'Repair';       Stage = 'Structure' }
    @{ Id = 11; Name = 'Merge Engine';                     Code = 'Merge';        Stage = 'Structure' }
    @{ Id = 12; Name = 'Cleanup Engine';                   Code = 'Cleanup';      Stage = 'Structure' }
    @{ Id = 13; Name = 'Migration Engine';                 Code = 'Migration';    Stage = 'Structure' }

    @{ Id = 14; Name = 'Expansion Engine';                 Code = 'Expansion';    Stage = 'Intelligence' }
    @{ Id = 15; Name = 'Compliance Engine';                Code = 'Compliance';   Stage = 'Intelligence' }
    @{ Id = 16; Name = 'Safety Engine';                    Code = 'Safety';       Stage = 'Intelligence' }
    @{ Id = 17; Name = 'Curriculum Intelligence Engine';   Code = 'CurrIQ';       Stage = 'Intelligence' }

    @{ Id = 18; Name = 'Automation Pipeline Engine';       Code = 'Pipeline';     Stage = 'Automation' }
    @{ Id = 19; Name = 'Curriculum QA Engine';             Code = 'QA';           Stage = 'Automation' }
    @{ Id = 20; Name = 'Curriculum Packaging Engine';      Code = 'Packaging';    Stage = 'Automation' }
    @{ Id = 21; Name = 'Deployment Engine';                Code = 'Deployment';   Stage = 'Automation' }
)

# Engine Lookup
function Get-SafeStepsEngines {
    param([string]$Stage, [int[]]$Id)

    $engines = $script:SafeStepsEngineRegistry

    if ($Stage) { $engines = $engines | Where-Object { $_.Stage -eq $Stage } }
    if ($Id)    { $engines = $engines | Where-Object { $Id -contains $_.Id } }

    $engines | Sort-Object Id
}

function Get-SafeStepsEngine {
    param([Parameter(Mandatory)][int]$Id)

    $engine = $script:SafeStepsEngineRegistry | Where-Object { $_.Id -eq $Id }
    if (-not $engine) { throw "Engine with Id $Id not found." }
    return $engine
}

# Engine Invocation
function Invoke-SafeStepsEngine {
    param(
        [Parameter(Mandatory)][int]$Id,
        [Parameter(Mandatory)][hashtable]$Context
    )

    $engine = Get-SafeStepsEngine -Id $Id
    Write-Host "Running Engine [$($engine.Id)] $($engine.Name)"

    switch ($engine.Code) {
        'Mapping'    { Invoke-SafeStepsMappingEngine        -Context $Context }
        'AutoGenV1'  { Invoke-SafeStepsAutoGenV1Engine      -Context $Context }
        'AutoGenV2'  { Invoke-SafeStepsAutoGenV2Engine      -Context $Context }
        'Validation' { Invoke-SafeStepsValidationEngine     -Context $Context }
        'Rollback'   { Invoke-SafeStepsRollbackEngine       -Context $Context }

        'Diff'       { Invoke-SafeStepsDiffEngine           -Context $Context }
        'Snapshot'   { Invoke-SafeStepsSnapshotEngine       -Context $Context }
        'Sync'       { Invoke-SafeStepsSyncEngine           -Context $Context }
        'Integrity'  { Invoke-SafeStepsIntegrityEngine      -Context $Context }
        'Repair'     { Invoke-SafeStepsRepairEngine         -Context $Context }
        'Merge'      { Invoke-SafeStepsMergeEngine          -Context $Context }
        'Cleanup'    { Invoke-SafeStepsCleanupEngine        -Context $Context }
        'Migration'  { Invoke-SafeStepsMigrationEngine      -Context $Context }

        'Expansion'  { Invoke-SafeStepsExpansionEngine      -Context $Context }
        'Compliance' { Invoke-SafeStepsComplianceEngine     -Context $Context }
        'Safety'     { Invoke-SafeStepsSafetyEngine         -Context $Context }
        'CurrIQ'     { Invoke-SafeStepsCurriculumIQEngine   -Context $Context }

        'Pipeline'   { Invoke-SafeStepsPipelineEngine       -Context $Context }
        'QA'         { Invoke-SafeStepsQAEngine             -Context $Context }
        'Packaging'  { Invoke-SafeStepsPackagingEngine      -Context $Context }
        'Deployment' { Invoke-SafeStepsDeploymentEngine     -Context $Context }

        default      { throw "No handler for engine code '$($engine.Code)'." }
    }
}

# Master Pipeline
function Invoke-SafeStepsMasterPipeline {
    param([hashtable]$Context = @{}, [int[]]$EngineIds)

    if (-not $Context.ContainsKey('StartedAt')) {
        $Context.StartedAt = Get-Date
    }

    $orderedEngines = if ($EngineIds) {
        Get-SafeStepsEngines -Id $EngineIds
    } else {
        Get-SafeStepsEngines
    }

    foreach ($engine in $orderedEngines) {
        Invoke-SafeStepsEngine -Id $engine.Id -Context $Context
    }

    $Context.CompletedAt = Get-Date
    Write-Host "SafeSteps Master Pipeline completed."
    return $Context
}

Export-ModuleMember -Function Get-SafeStepsEngines, Get-SafeStepsEngine, Invoke-SafeStepsEngine, Invoke-SafeStepsMasterPipeline
