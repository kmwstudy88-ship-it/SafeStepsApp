Write-Host 'Rebuilding SafeSteps system...'

Write-Host 'Cleaning backend...'
Remove-Item -Force -Recurse backend/node_modules
Remove-Item -Force -Recurse backend/db/dev.db

Write-Host 'Cleaning dashboard...'
Remove-Item -Force -Recurse caseworker-dashboard/node_modules

Write-Host 'Cleaning mobile app...'
Remove-Item -Force -Recurse app/node_modules

Write-Host 'Reinstalling dependencies...'
cd backend; npm install; npx prisma db push; cd ..
cd caseworker-dashboard; npm install; cd ..
cd app; npm install; cd ..

Write-Host 'Rebuild complete.'
