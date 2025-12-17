# Travel Planner - Quick Start Guide

## Project Overview
This is a full-stack AI-powered travel planner application that generates personalized travel itineraries. The project consists of three main components:
1. Mobile App (React Native/Expo)
2. Backend API (FastAPI/Python)
3. Frontend Web App (React/TypeScript)

## Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm/yarn
- Git

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Charandeep2/travel-planner-mobile-app-static.git
cd travel-planner-mobile-app-static
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### 3. Mobile App Setup
```bash
cd ../TravelPlannerMobile
npm install
```

### 4. Frontend Setup (Optional)
```bash
cd ../frontend
npm install
```

## Running the Application

### 1. Start Backend Server
```bash
cd backend
python main.py
# Server will start on http://localhost:8000
```

### 2. Start Mobile App
```bash
cd TravelPlannerMobile
npx expo start
# For web version: npx expo start --web
```

### 3. Start Frontend Web App (Optional)
```bash
cd frontend
npm run dev
# App will be available at http://localhost:5173
```

## Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory:
```
GEMINI_API_KEY=your_google_gemini_api_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Mobile App (.env)
Create a `.env` file in the `TravelPlannerMobile` directory:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints
- GET `/` - Health check
- POST `/generate-itinerary` - Generate travel itinerary
- POST `/send-otp` - Send OTP via email (disabled in current version)
- POST `/verify-otp` - Verify OTP (disabled in current version)

## Features
- AI-powered itinerary generation using Google Gemini
- Beautiful UI with futuristic gradient designs
- Cross-platform mobile app (iOS/Android/Web)
- Interactive maps for locations
- Detailed day-by-day planning
- Budget estimation
- No authentication required (simplified flow)

## Troubleshooting
1. **Port Conflicts**: Change ports in `backend/main.py` and update `EXPO_PUBLIC_API_URL` accordingly
2. **API Connection Issues**: Ensure backend is running before starting mobile app
3. **Missing Dependencies**: Run `npm install` or `pip install -r requirements.txt` in respective directories

## Project Structure
```
├── TravelPlannerMobile/     # React Native mobile app
├── backend/                 # FastAPI backend server
├── frontend/                # React web frontend (optional)
├── QUICK_START.md           # This file
└── README.md                # Detailed project documentation
```

## Accessing the Apps
- **Mobile App**: Scan QR code from Expo DevTools or use simulator
- **Web Version**: Visit http://localhost:8102 after starting mobile app with `--web` flag
- **Backend API**: http://localhost:8000
- **Frontend Web App**: http://localhost:5173 (if started)

## Customization
- **UI Colors**: Modify gradient colors in screen components
- **API Integration**: Update `ai_planner.py` for different AI models
- **Map Integration**: Configure in `itinerary.tsx` files

## Support
For issues or questions, check the GitHub repository or contact the development team.