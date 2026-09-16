. $PSScriptRoot\Get-Timestamp.ps1
param(
    [string]$Command,
    [string]$Sub,
    [string]$Arg1,
    [string]$Arg2,
    [string]$Arg3,
    [string]$Arg4
)

switch ("$Command $Sub") {

    # -------------------------
    # APPOINTMENTS
    # -------------------------
    "appointment new" {
        New-Appointment -Id $Arg1 -Type $Arg2 -Date $Arg3 -With $Arg4
    }
    "appointment attend" {
        Attend-Appointment -Id $Arg1
    }

    # -------------------------
    # MESSAGING
    # -------------------------
    "message send" {
        Send-Message -ThreadId $Arg1 -Sender $Arg2 -Message $Arg3
    }
    "message read" {
        Read-Message -ThreadId $Arg1 -Index $Arg2
    }

    # -------------------------
    # SAFETY PLANS
    # -------------------------
    "safety new" {
        New-SafetyPlan -Id $Arg1 -Title $Arg2
    }
    "safety add-step" {
        Add-SafetyStep -PlanId $Arg1 -Step $Arg2
    }

    # -------------------------
    # GOALS
    # -------------------------
    "goal new" {
        New-Goal -Id $Arg1 -Description $Arg2
    }
    "goal update" {
        Update-GoalProgress -GoalId $Arg1 -Entry $Arg2
    }
    "goal complete" {
        Complete-Goal -GoalId $Arg1
    }

    # -------------------------
    # AUDIT LOG
    # -------------------------
    "audit add" {
        Add-AuditEntry -Action $Arg1 -Caseworker $Arg2 -Details $Arg3
    }

    # -------------------------
    # JOURNAL
    # -------------------------
    "journal add" {
        Add-JournalEntry -Entry $Arg1
    }

    # -------------------------
    # COURT BUNDLE
    # -------------------------
    "court bundle" {
        Generate-CourtBundle -OutputFolder $Arg1
    }

    # -------------------------
    # PROGRAMS
    # -------------------------
    "program new" {
        New-Program -Id $Arg1 -Title $Arg2
    }

    # -------------------------
    # IDENTITY
    # -------------------------
    "identity verify" {
        Verify-Identity -ParentName $Arg1 -DocumentType $Arg2 -DocumentId $Arg3
    }

    # -------------------------
    # CHAIN OF CUSTODY
    # -------------------------
    "custody add" {
        Add-ChainOfCustody -FileName $Arg1 -Action $Arg2 -By $Arg3
    }

    default {
        Write-Host "Unknown command: $Command $Sub"
    }
}

