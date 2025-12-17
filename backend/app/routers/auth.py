from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
import jwt
import os
from datetime import datetime, timedelta
from app.services.otp_service import create_otp, verify_otp, send_otp_email

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Request/Response models
class OtpRequest(BaseModel):
    email: str

class OtpVerification(BaseModel):
    email: str
    otp: str

class TokenResponse(BaseModel):
    token: str
    email: str

# In-memory user storage (in production, use a database)
users: Dict[str, dict] = {}

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/request-otp")
async def request_otp(request: OtpRequest):
    """
    Request OTP for email authentication.
    Generates a 6-digit OTP and sends it to the user's email.
    """
    email = request.email.strip().lower()
    
    # Validate email format
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    try:
        # Generate OTP (will use EmailJS or fallback)
        otp = create_otp(email)
        
        # Return success response (don't reveal the OTP in the response)
        return {"message": "OTP sent successfully (or printed to console in fallback mode)"}
    except Exception as e:
        # Even if EmailJS fails, we still allow login via fallback
        print(f"Warning: EmailJS failed but continuing with fallback mode: {e}")
        return {"message": "EmailJS failed, but you can use any 6-digit code to login"}

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(request: OtpVerification):
    """
    Verify OTP and return JWT token.
    """
    email = request.email.strip().lower()
    otp = request.otp.strip()
    
    # Validate OTP format
    if not otp.isdigit() or len(otp) != 6:
        raise HTTPException(status_code=400, detail="Invalid OTP format")
    
    # Verify OTP (will use fallback if EmailJS failed)
    is_valid = verify_otp(email, otp)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    
    # Create or get user
    if email not in users:
        users[email] = {
            "email": email,
            "created_at": datetime.utcnow()
        }
    
    # Create access token
    access_token = create_access_token(data={"sub": email})
    
    return {"token": access_token, "email": email}

# Dependency for protected routes
def get_current_user(token: str):
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Add this to validate authorization header
async def get_authorization_header(authorization: str = None):
    """Extract token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    return authorization[7:]  # Remove "Bearer " prefix