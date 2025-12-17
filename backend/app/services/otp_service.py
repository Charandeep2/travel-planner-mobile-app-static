import random
import time
from typing import Dict, Optional, Tuple
import os
from dotenv import load_dotenv
from app.services.emailjs_service import send_otp_email

# Load environment variables
load_dotenv()

# In-memory storage for OTPs (in production, use Redis or database)
otp_storage: Dict[str, Tuple[str, float]] = {}

# Flag to track if EmailJS is working
emailjs_working = True

def generate_random_otp() -> str:
    """
    Generate a random 6-digit OTP.
    
    Returns:
        Generated OTP string
    """
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def store_otp(email: str, otp: str) -> None:
    """
    Store OTP with 10-minute expiration (600 seconds).
    
    Args:
        email: User's email address
        otp: OTP to store
    """
    expiration_time = time.time() + 600
    otp_storage[email] = (otp, expiration_time)

def create_otp(email: str) -> str:
    """
    Generate a random 6-digit OTP, store it with expiration time, and send it via EmailJS.
    
    Args:
        email: User's email address
        
    Returns:
        Generated OTP string
    """
    global emailjs_working
    
    # Generate 6-digit OTP
    otp = generate_random_otp()
    
    # Store OTP with expiration
    store_otp(email, otp)
    
    # Try to send via EmailJS
    try:
        success = send_otp_email(email, otp)
        if success:
            print("✅ EmailJS sent OTP successfully")
            emailjs_working = True
        else:
            print("⚠️ EmailJS failed to send OTP, enabling fallback mode")
            emailjs_working = False
            # Print OTP to console for fallback
            print(f"🔐 Fallback Mode: OTP for {email}: {otp}")
    except Exception as e:
        print(f"⚠️ EmailJS error: {e}")
        emailjs_working = False
        # Print OTP to console for fallback
        print(f"🔐 Fallback Mode: OTP for {email}: {otp}")
    
    return otp

def verify_otp(email: str, otp: str) -> bool:
    """
    Verify that the provided OTP matches the stored one and is not expired.
    If EmailJS is not working, accepts any 6-digit code.
    
    Args:
        email: User's email address
        otp: OTP to verify
        
    Returns:
        True if OTP is valid and not expired, False otherwise
    """
    global emailjs_working
    
    # If EmailJS is not working, accept any 6-digit code
    if not emailjs_working:
        print("🔓 Fallback Mode: Accepting any 6-digit code")
        return otp.isdigit() and len(otp) == 6
    
    # Normal verification when EmailJS is working
    if email not in otp_storage:
        return False
    
    stored_otp, expiration_time = otp_storage[email]
    
    # Check if OTP is expired
    if time.time() > expiration_time:
        # Remove expired OTP
        del otp_storage[email]
        return False
    
    # Check if OTP matches
    if stored_otp != otp:
        return False
    
    # Remove used OTP
    del otp_storage[email]
    return True