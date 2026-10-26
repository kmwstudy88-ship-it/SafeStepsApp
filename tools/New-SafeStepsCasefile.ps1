param(
    [Parameter(Mandatory = $true)]
    [string]$CaseID,

    [Parameter(Mandatory = $true)]
    [ValidateSet("single", "joint", "dual")]
    [string]$AccountMode,

    [Parameter(Mandatory = $true)]
    [string]$MotherID,

    [Parameter(Mandatory = $true)]
    [string]$FatherID,

    [string]$OutputRoot = (Get-Location).Path
)

$resolvedRoot = (Resolve-Path -LiteralPath $OutputRoot).Path
$casePath = Join-Path $resolvedRoot "casefiles\$CaseID"
$parentsPath = Join-Path $resolvedRoot "parents"

function Get-AccountLinkedFlag {
    param([string]$Mode)
    return $Mode -ne "dual"
}

function New-ParentObject {
    param(
        [string]$ParentID,
        [ValidateSet("mother", "father")]
        [string]$Role,
        [string]$Mode
    )

    return @{
        parent_id = $ParentID
        role = $Role
        account_linked = Get-AccountLinkedFlag -Mode $Mode
        identity = @{
            name = ""
            legal_status = ""
            primary_responsibilities = @()
        }
        protective_capacities = @{
            emotional_regulation = ""
            supervision_quality = ""
            safety_planning_behavior = ""
            trauma_awareness = ""
        }
        risk_indicators = @{
            coercive_control_patterns = ""
            substance_use_flags = ""
            mental_health_risk = ""
            exposure_to_violence = ""
        }
        parenting_behaviors = @{
            attunement_examples = ""
            discipline_style = ""
            responsiveness_to_child_distress = ""
        }
        engagement = @{
            attendance = ""
            homework_completion = ""
            reflective_insights = ""
        }
    }
}

New-Item -ItemType Directory -Force -Path $casePath | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $parentsPath $MotherID) | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $parentsPath $FatherID) | Out-Null

$motherParent = New-ParentObject -ParentID $MotherID -Role "mother" -Mode $AccountMode
$fatherParent = New-ParentObject -ParentID $FatherID -Role "father" -Mode $AccountMode

switch ($AccountMode) {
    "single" { $parents = @($motherParent) }
    "joint" { $parents = @($motherParent, $fatherParent) }
    "dual" { $parents = @($motherParent, $fatherParent) }
}

$casefile = @{
    case_id = $CaseID
    account_mode = $AccountMode
    children = @()
    parents = $parents
}

$casefile | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $casePath "casefile.json")
$motherParent | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $parentsPath "$MotherID\profile.json")
$fatherParent | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $parentsPath "$FatherID\profile.json")

[pscustomobject]@{
    casefile = Join-Path $casePath "casefile.json"
    motherProfile = Join-Path $parentsPath "$MotherID\profile.json"
    fatherProfile = Join-Path $parentsPath "$FatherID\profile.json"
}
