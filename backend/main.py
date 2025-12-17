from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import os
from dotenv import load_dotenv
import jwt

# Load environment variables
load_dotenv()

# Check for required environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set. Please set the GEMINI_API_KEY environment variable.")

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

from app.services.ai_planner import generate_itinerary
from schemas import TripRequest, Itinerary
from app.routers import auth
from app.routers.auth import router as auth_router

app = FastAPI(
    title="Agentic Travel Planner API",
    description="API for generating travel itineraries using AI function calling",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)

# Add this to validate authorization header
async def get_authorization_header(authorization: str = None):
    """Extract token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    return authorization[7:]  # Remove "Bearer " prefix

# Dependency for protected routes
async def verify_token(authorization: str = Depends(get_authorization_header)):
    """Verify JWT token and return user email"""
    try:
        payload = jwt.decode(authorization, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/generate-itinerary", response_model=Itinerary)
async def generate_itinerary_endpoint(request: TripRequest):
    """
    Generate a travel itinerary based on the provided trip request.
    """
    try:
        # Validate required fields
        if not request.trip_description:
            raise HTTPException(status_code=400, detail="Trip description is required")
        
        print("🔍 Starting itinerary generation...")
        print(f"📝 Trip description: {request.trip_description}")
        print(f"📅 Days: {request.days}")
        print(f"🏷️ Tags: {request.trip_tags}")
        print(f"💰 Budget: {request.budget_level}")
        print(f"📅 Start date: {request.start_date}")
        print(f"🖼️ Image provided: {'Yes' if request.inspiration_image else 'No'}")
        
        # Generate itinerary using the AI planner service
        itinerary = generate_itinerary(request)
        
        print("✅ Itinerary generated successfully")
        return itinerary
    except Exception as e:
        print(f"❌ Itinerary generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)