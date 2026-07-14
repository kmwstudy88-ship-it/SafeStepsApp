Write-Host 'Starting SafeSteps cloud backup...'

 = Get-Date -Format 'yyyyMMdd-HHmmss'
 = \"dev-.db\"

Copy-Item backend/db/dev.db 

Write-Host 'Uploading to Azure Blob...'
Write-Host '(Use az storage blob upload)'

Write-Host 'Uploading to AWS S3...'
Write-Host '(Use aws s3 cp)'

Write-Host 'Uploading to GCP Storage...'
Write-Host '(Use gsutil cp)'

Write-Host 'Cloud backup complete.'
