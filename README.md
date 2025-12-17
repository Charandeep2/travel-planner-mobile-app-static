# Agentic Travel Planner

A full-stack web application that generates personalized travel itineraries using Google Gemini AI. Users can describe their dream trip, upload an inspiration image, and receive a structured itinerary in JSON format.

## Features

- **Modern UI**: Responsive React + TypeScript frontend with Tailwind CSS
- **AI-Powered**: Backend powered by Google Gemini AI with FastAPI
- **Structured Data**: Strongly typed JSON itinerary responses
- **Image Support**: Upload inspiration images for mood-based trip planning
- **Customizable**: Filter trips by budget, duration, and trip type
- **Real AI Integration**: Uses Google Gemini for generating realistic travel itineraries
- **Email + OTP Authentication**: Secure login system with email verification via EmailJS

## Project Structure

```
agentic-travel-planner/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   └── auth.py
│   │   └── services/
│   │       ├── ai_planner.py
│   │       ├── otp_service.py
│   │       └── emailjs_service.py
│   ├── main.py
│   ├── schemas.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── services/
    │   ├── types.ts
    │   ├── App.tsx
    │   └── main.ts
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up your Google Gemini API key:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
     1. Sign in with your Google account
     2. Click "Get API key" 
     3. Create a new API key
     4. Copy the key and paste it in the `.env` file

6. Set up EmailJS for OTP emails:
   - Go to [EmailJS](https://www.emailjs.com/) and create an account
   - Create an Email Service (Gmail, Outlook, etc.)
   - Create an Email Template with variables:
     - `to_email`
     - `otp_code` 
     - `app_name`
   - Copy Service ID, Public Key (Template Access Token), Template ID
   - Add to backend/.env:
     ```
     EMAILJS_SERVICE_ID=service_abc123
     EMAILJS_PUBLIC_KEY=user_xyz789
     EMAILJS_TEMPLATE_ID=template_def456
     ```

7. Run the backend server:
   ```bash
   python main.py
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Health Check
- `GET /health` - Check if the backend is running

### Authentication
- `POST /auth/request-otp` - Request OTP for email authentication
- `POST /auth/verify-otp` - Verify OTP and get JWT token

### Itinerary Generation
- `POST /api/generate-itinerary` - Generate a travel itinerary based on user input (requires authentication)

## Authentication Flow

1. User enters email on the login screen
2. Backend generates a 6-digit OTP and sends it via EmailJS
3. User receives OTP via email
4. User enters OTP in the app
5. Backend verifies OTP and returns a JWT token
6. Frontend stores token and allows access to the planner

## EmailJS Template Example

Create this template in your EmailJS dashboard:

```
Subject: Your Agentic Travel Planner Login Code

Hi there,

Your 6-digit login code is: {{otp_code}}

This code expires in 10 minutes.

Happy trip planning!
{{app_name}}
```

## Development

### Backend Development

The backend is built with FastAPI and includes:
- Pydantic models for request/response validation
- Google Gemini AI integration for generating realistic itineraries
- Email + OTP authentication system with EmailJS
- JWT token-based security

To extend the functionality:
1. Modify `schemas.py` to update data models
2. Enhance `app/services/ai_planner.py` to improve itinerary generation logic
3. Add new endpoints in `main.py` as needed

### Frontend Development

The frontend is built with React, TypeScript, and Tailwind CSS:
- Responsive design that works on mobile and desktop
- Component-based architecture
- TypeScript for type safety
- Vite for fast development
- React Router for navigation
- JWT-based authentication

To extend the frontend:
1. Add new components in `src/components/`
2. Update styling in `src/style.css`
3. Modify API calls in `src/services/api.ts`

### Environment Variables

For production deployment:
- Set the `GEMINI_API_KEY` environment variable through your hosting platform's settings
- Set the `JWT_SECRET_KEY` to a strong secret key
- Configure EmailJS settings:
  - `EMAILJS_SERVICE_ID`: Your EmailJS service ID
  - `EMAILJS_PUBLIC_KEY`: Your EmailJS public key
  - `EMAILJS_TEMPLATE_ID`: Your EmailJS template ID

## Deployment

For production deployment:
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Serve the built files with a web server
3. Deploy the backend to a Python hosting service
4. Configure environment variables as needed

## Desktop App Version

This project has been converted to a desktop app version that can run locally:

1. Double-click on `launch-app.bat` to start the app
2. Open your browser and go to http://localhost:3000
3. The app will be running locally on your computer

See `APP_INSTRUCTIONS.md` for more detailed instructions on using the desktop version.

## Mobile App Version

This project also includes a React Native mobile app version that can be installed on Android and iOS devices:

1. Navigate to the `TravelPlannerMobile` directory
2. Install dependencies with `npm install`
3. Start the app with `npm start`
4. Scan the QR code with Expo Go on your mobile device

See `TravelPlannerMobile/MOBILE_APP_README.md` for more detailed instructions on using the mobile version.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.