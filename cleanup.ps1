Write-Host 'Cleaning SafeSteps project...'

Remove-Item -Force -Recurse backend/logs/*
Remove-Item -Force -Recurse backend/temp/*
Remove-Item -Force -Recurse app/.expo/*
Remove-Item -Force -Recurse caseworker-dashboard/.cache/*

Write-Host 'Cleanup complete.'
