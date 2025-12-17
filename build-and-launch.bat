@echo off
echo Building Travel Planner App...
cd /d "C:\Users\durga\OneDrive\documents-2\travel-planner-master\frontend"
call npm run build
echo.
echo Launching Travel Planner App...
echo The app will be available at http://localhost:3000
echo Press Ctrl+C to stop the server
cd /d "C:\Users\durga\OneDrive\documents-2\travel-planner-master"
node server.js