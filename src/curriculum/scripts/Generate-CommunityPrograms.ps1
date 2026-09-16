# ============================================
# Generate-CommunityPrograms.ps1
# SafeSteps Community Program Link Hub
# With IDs, sorting, and category grouping
# ============================================

# 1. Raw program list (flat)
$programs = @(
    # Parenting
    @{
        category = "Parenting"
        name = "ParentWorks"
        description = "Free online evidence-based parenting program for parents of children aged 2–17."
        link = "https://parentworks.org.au"
        provider = "University of Sydney"
    },
    @{
        category = "Parenting"
        name = "Triple P – Positive Parenting Program"
        description = "World-leading parenting program with modules for babies, children, teens, anxiety, and behaviour."
        link = "https://www.triplep-parenting.net.au"
        provider = "Triple P International"
    },
    @{
        category = "Parenting"
        name = "Circle of Security Parenting (COSP)"
        description = "Attachment-based parenting program focused on strengthening parent–child relationships."
        link = "https://www.circleofsecurityinternational.com"
        provider = "COSI"
    },
    @{
        category = "Parenting"
        name = "1-2-3 Magic & Emotion Coaching"
        description = "Behaviour management program for parents of children aged 2–12."
        link = "https://www.parentingideas.com.au"
        provider = "Parenting Ideas"
    },

    # Mental Health
    @{
        category = "Mental Health"
        name = "Medicare Mental Health"
        description = "National mental health supports including hubs, phone services, and digital tools."
        link = "https://www.medicarementalhealth.gov.au"
        provider = "Australian Government"
    },
    @{
        category = "Mental Health"
        name = "Queensland Mental Health Services"
        description = "Statewide mental health supports including 1300 MH CALL, crisis lines, and community hubs."
        link = "https://www.qld.gov.au/health/mental-health"
        provider = "Queensland Health"
    },

    # AOD
    @{
        category = "AOD"
        name = "ADIS Queensland"
        description = "24/7 confidential alcohol and drug counselling, information, and referral."
        link = "https://adis.health.qld.gov.au"
        provider = "Queensland Health"
    },
    @{
        category = "AOD"
        name = "Breakthrough for Families"
        description = "Support for families affected by alcohol and other drug use."
        link = "https://www.qld.gov.au/health/mental-health/help-lines/breakthrough-for-families"
        provider = "Queensland Health"
    },
    @{
        category = "AOD"
        name = "SMART Recovery"
        description = "Peer-led support groups for people wanting to change addictive behaviours."
        link = "https://smartrecoveryaustralia.com.au"
        provider = "SMART Recovery Australia"
    },

    # DFV
    @{
        category = "DFV"
        name = "ANROWS"
        description = "Australia’s national research organisation for women’s safety, providing evidence on DFV and sexual violence."
        link = "https://www.anrows.org.au"
        provider = "ANROWS"
    },
    @{
        category = "DFV"
        name = "QCDFVR"
        description = "Queensland Centre for Domestic and Family Violence Research providing training, resources, and evidence summaries."
        link = "https://www.novi.qld.edu.au/qcdfvr"
        provider = "QCDFVR"
    },
    @{
        category = "DFV"
        name = "Safer Families, Safer Communities (QLD DFV Strategy)"
        description = "Queensland’s whole-of-community DFV reform strategy focusing on prevention, intervention, and recovery."
        link = "https://www.qld.gov.au/community/getting-support-health-social-issue/domestic-family-violence"
        provider = "Queensland Government"
    }
)

# 2. Add IDs and sort by name
$idCounter = 1
$programsWithId = $programs |
    Sort-Object -Property name |
    ForEach-Object {
        $_ | Add-Member -NotePropertyName "id" -NotePropertyValue $idCounter -Force
        $idCounter++
        $_
    }

# 3. Group by category into a clean structure
$grouped = $programsWithId |
    Group-Object -Property category |
    ForEach-Object {
        [PSCustomObject]@{
            category = $_.Name
            programs = $_.Group
        }
    }

# 4. Wrap in a root object (nice for APIs)
$root = [PSCustomObject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    totalPrograms = $programsWithId.Count
    categories = $grouped
}

# 5. Convert to JSON
$json = $root | ConvertTo-Json -Depth 10

# 6. Ensure data folder exists
$dataPath = Join-Path $PSScriptRoot "..\data"
if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath | Out-Null
}

# 7. Output path
$outputPath = Join-Path $dataPath "community-programs.json"

# 8. Save file
Set-Content -Path $outputPath -Value $json -Encoding UTF8

Write-Host "Community Program Directory generated successfully at $outputPath"
