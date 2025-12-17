@echo off
echo Starting Travel Planner Mobile App...
echo Make sure the backend server is running on port 8000
echo.
echo The app will be available at:
echo - Android/iOS: Scan the QR code with Expo Go
echo - Web: http://localhost:8102
echo.
echo Press Ctrl+C to stop the server
cd /d "C:\Users\durga\OneDrive\documents-2\travel-planner-master\TravelPlannerMobile"
npx expo start --port 8102
pause