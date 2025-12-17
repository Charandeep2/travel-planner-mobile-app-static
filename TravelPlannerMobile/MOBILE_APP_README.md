# Travel Planner Mobile App

## Overview
This is a React Native mobile application for the Agentic Travel Planner. It provides all the functionality of the web version in a native mobile experience.

## Features
- Email + OTP authentication
- AI-powered travel itinerary generation
- Interactive map view
- Customizable trip planning based on budget, duration, and preferences

## Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Android Studio or Xcode for emulator/simulator
- Physical device for testing (optional)

## Installation

1. Navigate to the project directory:
   ```
   cd TravelPlannerMobile
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the App

### For Development
1. Start the Expo development server:
   ```
   npm start
   ```

2. Choose your target platform:
   - Press `a` to run on Android emulator/device
   - Press `i` to run on iOS simulator (macOS only)
   - Press `w` to run on web browser

Alternatively, you can start the app directly on a specific port:
```
npx expo start --port 8102
```

### For Production
1. Build for Android:
   ```
   expo build:android
   ```

2. Build for iOS (macOS only):
   ```
   expo build:ios
   ```

## Project Structure
```
app/
  (auth)/          # Authentication screens
    login.tsx       # Login screen
    verify-otp.tsx  # OTP verification screen
    _layout.tsx     # Authentication layout
  (main)/           # Main app screens
    home.tsx        # Home/trip planning screen
    itinerary.tsx   # Itinerary display screen
    _layout.tsx     # Main app layout
  _layout.tsx       # Root layout
```

## API Configuration
The app connects to the backend API running on `http://localhost:8000`. Make sure the backend server is running for full functionality.

For mobile devices, you'll need to update the API URL to your computer's IP address:
1. Find your computer's IP address
2. Update the `.env` file with your computer's IP address:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000
   ```

Alternatively, you can modify the API URLs directly in:
   - `app/(auth)/login.tsx`
   - `app/(auth)/verify-otp.tsx`
   - `app/(main)/home.tsx`

## Dependencies
- React Native
- Expo
- Axios for API requests
- React Navigation for routing
- Async Storage for token storage
- React Native Maps for interactive maps

## Notes
- For full functionality, you'll need to configure the Google Gemini API key and EmailJS settings in the backend `.env` file
- The app requires an active internet connection to communicate with the backend API