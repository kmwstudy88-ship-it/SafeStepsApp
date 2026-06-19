param(
    [string]$name
)

$root = "C:\Users\SAFES\SafeStepsApp"
$engine = Join-Path $root "engine"
$assessments = Join-Path $engine "assessments"
$resultsDir = Join-Path $engine "results"

$module = Join-Path $assessments $name

if (!(Test-Path $module)) {
    Write-Host "Assessment module not found: $name"
    exit
}

$files = Get-ChildItem $module -Filter *.json | Sort-Object Name

if ($files.Count -eq 0) {
    Write-Host "No assessment files found."
    exit
}

if (!(Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

$results = @()
$totalRisk = 0
$totalProtective = 0

foreach ($file in $files) {

    $json = Get-Content $file.FullName -Raw | ConvertFrom-Json

    Write-Host ""
    Write-Host "====================================="
    Write-Host "DOMAIN: $($json.domain)"
    Write-Host "====================================="
    Write-Host ""

    $domainAnswers = @()

    foreach ($q in $json.questions) {
        Write-Host "Q: $q"
        $answer = Read-Host "Your answer"
        $domainAnswers += $answer
    }

    $riskScore = $json.risk_indicators.Count
    $protectScore = $json.protective_indicators.Count

    $totalRisk += $riskScore
    $totalProtective += $protectScore

    $results += [ordered]@{
        domain = $json.domain
        answers = $domainAnswers
        risk_indicators = $json.risk_indicators
        protective_indicators = $json.protective_indicators
        risk_score = $riskScore
        protective_score = $protectScore
    }
}

if ($totalRisk -gt $totalProtective) {
    $overall = "High Risk"
} elseif ($totalRisk -eq $totalProtective) {
    $overall = "Moderate Risk"
} else {
    $overall = "Lower Risk"
}

$timestamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
$outfile = Join-Path $resultsDir "assessment-$name-$timestamp.json"

$resultsObject = [ordered]@{
    assessment = $name
    completed_at = (Get-Date)
    total_risk = $totalRisk
    total_protective = $totalProtective
    overall_rating = $overall
    domains = $results
}

$resultsObject | ConvertTo-Json -Depth 10 | Out-File $outfile -Encoding utf8

Write-Host ""
Write-Host "====================================="
Write-Host "ASSESSMENT COMPLETE"
Write-Host "Overall Rating: $overall"
Write-Host "Saved to: $outfile"
Write-Host "====================================="
