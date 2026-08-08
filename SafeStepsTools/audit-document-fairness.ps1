param(
    [Parameter(Mandatory = $true)]
    [string]$CaseId,

    [Parameter(Mandatory = $true)]
    [string]$OutputCsv,

    [string]$ApiBaseUrl = $(if ($env:SAFESTEPS_API_BASE_URL) { $env:SAFESTEPS_API_BASE_URL } else { "http://localhost:3000" }),
    [string]$AccessToken = $env:SAFESTEPS_ACCESS_TOKEN,
    [string]$SupabaseUrl = $env:SUPABASE_URL,
    [string]$SupabasePublishableKey = $(if ($env:SUPABASE_PUBLISHABLE_KEY) { $env:SUPABASE_PUBLISHABLE_KEY } else { $env:EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY })
)

if ([string]::IsNullOrWhiteSpace($AccessToken)) {
    throw "Set SAFESTEPS_ACCESS_TOKEN before running this audit."
}
if ([string]::IsNullOrWhiteSpace($SupabaseUrl) -or [string]::IsNullOrWhiteSpace($SupabasePublishableKey)) {
    throw "Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
}

$headers = @{
    "Authorization" = "******"
    "apikey"        = $SupabasePublishableKey
}

$recordsUri = "$SupabaseUrl/rest/v1/evidence_records?select=id,evidence_type,evidence_description&case_id=eq.$CaseId&deleted=is.false"
$records = Invoke-RestMethod -Method Get -Uri $recordsUri -Headers $headers

if (-not $records -or $records.Count -eq 0) {
    Write-Warning "No evidence records found for case $CaseId"
    @() | Export-Csv -NoTypeInformation -Path $OutputCsv
    return
}

$apiHeaders = @{
    "Authorization" = "******"
    "Content-Type"  = "application/json"
}

$rows = foreach ($record in $records) {
    $text = [string]$record.evidence_description
    if ([string]::IsNullOrWhiteSpace($text)) {
        $text = "No evidence description was provided for this record."
    }

    $body = @{
        caseId     = $CaseId
        documentId = $record.id
        text       = $text
    } | ConvertTo-Json -Depth 10

    $analysis = Invoke-RestMethod -Method Post -Uri "$ApiBaseUrl/documents/analyze/fairness" -Headers $apiHeaders -Body $body

    [pscustomobject]@{
        document_id                     = $record.id
        document_type                   = $record.evidence_type
        fairness_score                  = $analysis.fairness_score
        bias_count                      = @($analysis.bias_indicators).Count
        coercion_count                  = @($analysis.coercion_flags).Count
        discrimination_count            = @($analysis.discrimination_risks).Count
        framing_issues                  = @($analysis.framing_concerns).Count
        remediation_recommendations     = (@($analysis.remediation_recommendations | ForEach-Object { $_.concern }) -join "; ")
        analyst_review_status           = "pending_human_review"
    }
}

$rows | Export-Csv -NoTypeInformation -Path $OutputCsv
Write-Host "Fairness audit exported to $OutputCsv ($($rows.Count) documents)."
