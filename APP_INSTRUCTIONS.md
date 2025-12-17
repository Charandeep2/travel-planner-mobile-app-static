# Travel Planner App

## How to Use This App

### Quick Start
1. Double-click on `launch-app.bat` to start the app
2. Open your browser and go to http://localhost:3000
3. The app will be running locally on your computer

### Alternative Methods

#### Method 1: Using Command Line
1. Open Command Prompt or PowerShell
2. Navigate to this folder:
   ```
   cd C:\Users\durga\OneDrive\documents-2\travel-planner-master
   ```
3. Run the app:
   ```
   npm start
   ```

#### Method 2: Build and Launch
1. Double-click on `build-and-launch.bat` to rebuild and launch the app
2. This will compile the latest version and start the server

### Stopping the App
- Close the command prompt window or press Ctrl+C

### Requirements
- Node.js (comes with npm)
- Modern web browser

### Features
- AI-powered travel itinerary generation
- Email + OTP authentication
- Interactive map view
- Customizable trip planning based on budget, duration, and preferences

### Note
For full functionality, you'll need to configure API keys:
1. Google Gemini API key for AI itinerary generation
2. EmailJS configuration for OTP authentication

These can be configured in the backend `.env` file.