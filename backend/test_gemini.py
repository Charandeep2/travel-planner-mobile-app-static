import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key Length: {len(GEMINI_API_KEY) if GEMINI_API_KEY else 0}")

if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not set")
    exit(1)

if GEMINI_API_KEY.startswith("your_") or len(GEMINI_API_KEY) < 20:
    print("ERROR: GEMINI_API_KEY still contains placeholder value or is too short")
    exit(1)

try:
    # Configure the API
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini configured successfully")
    
    # Test the API key by listing models
    print("🔍 Testing API key validity...")
    models = genai.list_models()
    model_names = [m.name for m in models]
    print(f"✅ API key is valid. Available models: {len(model_names)}")
    if model_names:
        print(f"📋 First few models: {model_names[:3]}")
    
    # Test generating content
    print("🔍 Testing content generation...")
    model = genai.GenerativeModel("models/gemini-flash-latest")
    response = model.generate_content("Generate a short JSON response with a travel destination")
    print(f"✅ Content generation successful. Response length: {len(response.text)}")
    print(f"Response preview: {response.text[:100]}...")
    print("🎉 Gemini API is working correctly with your new key!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()