Write-Host 'Incrementing SafeSteps version...'

 = 'version.txt'

if (-Not (Test-Path )) {
    Set-Content -Path  -Value '0.1.0'
}

 = Get-Content 
 = .Split('.')
[2] = [int][2] + 1
 = \"..\"

Set-Content -Path  -Value 

Write-Host \"New version: \"
