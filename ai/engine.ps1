function Invoke-SafeStepsAI {
    param(
        [string]$programName,
        [string]$stageName,
        [string]$weekName,
        [string]$lessonTitle
    )

    # Load the prompt template
    $templatePath = "C:\Users\SAFES\SafeStepsApp\ai\prompt-template.txt"
    $template = Get-Content $templatePath -Raw

    # Insert variables into the template
    $prompt = $template `
        -replace "{{programName}}", $programName `
        -replace "{{stageName}}", $stageName `
        -replace "{{weekName}}", $weekName `
        -replace "{{lessonTitle}}", $lessonTitle

    # Build JSON body for Groq
    $jsonBody = @"
{
  "model": "llama3-70b-8192",
  "messages": [
    {
      "role": "system",
      "content": "You are SafeSteps AI."
    },
    {
      "role": "user",
      "content": "$prompt"
    }
  ],
  "temperature": 0.4,
  "max_tokens": 1500
}
"@

    # Convert to UTF8 bytes
    $body = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)

    # Send request to Groq
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api.groq.com/openai/v1/chat/completions" `
            -Headers @{ 
                "Authorization" = "Bearer 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"
                "Content-Type"  = "application/json"
            } `
            -Method Post `
            -Body $body
    }
    catch {
        Write-Host "❌ API request failed:"
        Write-Host $_.Exception.Message
        return $null
    }

    # Safe return handling
    if ($response -and $response.choices) {
        try {
            return $response.choices[0].message.content | ConvertFrom-Json
        }
        catch {
            Write-Host "⚠️ AI returned non-JSON content:"
            Write-Host $response.choices[0].message.content
            return $null
        }
    }
    else {
        Write-Host "⚠️ AI returned no choices. Full response:"
        Write-Host ($response | ConvertTo-Json -Depth 10)
        return $null
    }
}
