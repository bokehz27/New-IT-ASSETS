@echo off
echo Starting Frontend...
start cmd /k "cd /d %~dp0it-asset-frontend && npm start"

echo Starting Backend...
start cmd /k "cd /d %~dp0it-asset-backend && npm run dev"

echo All done! Both Frontend and Backend are running.
pause
