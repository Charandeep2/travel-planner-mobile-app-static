import requests
import os
import json
from typing import Dict

EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send"

def send_otp_email(email: str, otp: str) -> bool:
    """
    Send OTP to user's email address using EmailJS.
    
    Args:
        email: Recipient's email address
        otp: OTP to send
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    # Debug: Show all environment variables (first few chars only for security)
    print("🔍 DEBUG: Environment Variables Check:")
    for key in ["EMAILJS_SERVICE_ID", "EMAILJS_PUBLIC_KEY", "EMAILJS_TEMPLATE_ID"]:
        value = os.getenv(key, "NOT_SET")
        if value != "NOT_SET":
            # Show only first 4 and last 4 characters for security
            masked_value = value[:4] + "..." + value[-4:] if len(value) > 8 else "TOO_SHORT"
            print(f"  {key}: {masked_value}")
        else:
            print(f"  {key}: NOT_SET")
    
    service_id = os.getenv("EMAILJS_SERVICE_ID")
    public_key = os.getenv("EMAILJS_PUBLIC_KEY")
    template_id = os.getenv("EMAILJS_TEMPLATE_ID")
    
    # Log configuration for debugging
    print(f"EmailJS Configuration Check:")
    print(f"  Service ID: {'SET' if service_id and service_id != 'your_service_id_here' else 'NOT SET or PLACEHOLDER'}")
    print(f"  Public Key: {'SET' if public_key and public_key != 'your_public_key_here' else 'NOT SET or PLACEHOLDER'}")
    print(f"  Template ID: {'SET' if template_id and template_id != 'your_template_id_here' else 'NOT SET or PLACEHOLDER'}")
    
    if not service_id or not public_key or not template_id:
        print("ERROR: EmailJS environment variables are missing")
        return False
    
    if service_id == "your_service_id_here" or public_key == "your_public_key_here" or template_id == "your_template_id_here":
        print("ERROR: EmailJS environment variables still contain placeholder values")
        return False
    
    # Check for example values
    if "example" in service_id or "example" in public_key or "example" in template_id:
        print("ERROR: EmailJS environment variables still contain example values")
        return False
    
    payload = {
        "service_id": service_id,
        "template_id": template_id,
        "user_id": public_key,
        "template_params": {
            "to_email": email,
            "otp_code": otp,
            "app_name": "Agentic Travel Planner"
        }
    }
    
    try:
        print(f"Sending OTP {otp} to {email} via EmailJS...")
        response = requests.post(EMAILJS_URL, json=payload, timeout=10)
        print(f"EmailJS Response Status: {response.status_code}")
        print(f"EmailJS Response Text: {response.text}")
        
        if response.status_code == 200:
            print(f"✅ OTP email sent successfully to {email}")
            return True
        else:
            print(f"❌ Failed to send OTP email. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception while sending OTP email: {e}")
        return False