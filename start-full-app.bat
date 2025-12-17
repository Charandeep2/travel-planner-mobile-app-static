@echo off
echo Starting Full Travel Planner App (Backend + Mobile)...
echo.
echo This will start:
echo 1. Backend server on port 8000
echo 2. Mobile app development server on port 8102
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend server in background
start "Backend Server" cmd /k "cd c:\Users\durga\OneDrive\documents-2\travel-planner-master\backend && python main.py"

REM Start mobile app server
cd /d "C:\Users\durga\OneDrive\documents-2\travel-planner-master\TravelPlannerMobile"
npx expo start --port 8102

pause