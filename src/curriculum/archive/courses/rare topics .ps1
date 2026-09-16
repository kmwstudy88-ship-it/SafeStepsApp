param(
    [string]$BasePath = "C:\Users\SAFES\safesteps-curriculum\courses\v1.2.0\rare-topics"
)

# Ensure base folders exist
$versionFolder = Split-Path $BasePath -Parent
if (-not (Test-Path $versionFolder)) {
    New-Item -ItemType Directory -Path $versionFolder | Out-Null
}
if (-not (Test-Path $BasePath)) {
    New-Item -ItemType Directory -Path $BasePath | Out-Null
}

# Define all Rare Topics courses (id + title)
$courses = @(
    @{ Id = "fathers-navigating-shame";              Title = "Fathers Navigating Shame After Violence" },
    @{ Id = "fathers-identity-collapse";             Title = "Fathers and Identity Collapse" },
    @{ Id = "children-refusing-contact";             Title = "Children Refusing Contact: Understanding the Child’s Perspective" },
    @{ Id = "fathers-supervised-contact";            Title = "Fathers Navigating Supervised Contact" },
    @{ Id = "fathers-child-protection-investigations"; Title = "Fathers Navigating Child Protection Investigations" },
    @{ Id = "fathers-court-ordered-programs";        Title = "Fathers Navigating Court-Ordered Programs" },
    @{ Id = "fathers-returning-from-prison";         Title = "Fathers Returning From Prison" },
    @{ Id = "fathers-in-prison-connection";          Title = "Fathers in Prison: Maintaining Safe Connection" },
    @{ Id = "fathers-experiencing-homelessness";     Title = "Fathers Experiencing Homelessness" },
    @{ Id = "fathers-neurodiversity";                Title = "Fathers With Neurodiversity (ADHD, Autism)" },
    @{ Id = "fathers-brain-injury";                  Title = "Fathers With Brain Injury or Cognitive Impairment" },
    @{ Id = "fathers-ptsd";                          Title = "Fathers With PTSD or Complex Trauma" },
    @{ Id = "fathers-chronic-illness";               Title = "Fathers With Chronic Illness or Disability" },
    @{ Id = "fathers-gambling-harm";                 Title = "Fathers With Gambling Harm" },
    @{ Id = "fathers-aod-recovery";                  Title = "Fathers With AOD Recovery and Parenting" },
    @{ Id = "fathers-rural-isolation";               Title = "Fathers in Rural or Remote Isolation" },
    @{ Id = "fathers-cultural-diversity";            Title = "Fathers From Culturally Diverse Backgrounds" },
    @{ Id = "fathers-blended-families";              Title = "Fathers Navigating Blended Families" },
    @{ Id = "fathers-new-partners";                  Title = "Fathers Navigating New Partners After DFV" },
    @{ Id = "fathers-grief-and-loss";                Title = "Fathers Navigating Grief and Loss After Separation" }
)

foreach ($course in $courses) {
    $folder   = Join-Path $BasePath $course.Id
    $jsonPath = Join-Path $folder "course.json"

    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
    }

    # If course.json already exists, skip to avoid overwriting manual edits
    if (Test-Path $jsonPath) {
        Write-Host "Skipping existing file: $jsonPath"
        continue
    }

    $jsonObject = [ordered]@{
        id              = $course.Id
        title           = $course.Title
        description     = ""
        learningOutcomes = @()
        modules         = @()
    }

    $json = $jsonObject | ConvertTo-Json -Depth 5
    $json | Out-File -FilePath $jsonPath -Encoding UTF8

    Write-Host "Created: $jsonPath"
}

Write-Host "Rare Topics course skeletons generated (or skipped if already present)."
