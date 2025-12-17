import os
import json
import re
import hashlib
import google.generativeai as genai
from typing import List
from schemas import TripRequest, Itinerary, DayPlan, Activity, ItineraryMeta


def generate_itinerary(request: TripRequest) -> Itinerary:
    """
    Generate a travel itinerary using Google Gemini AI with function calling.
    """
    try:
        print("=" * 50)
        print("🚀 STARTING ITINERARY GENERATION")
        print("=" * 50)
        print(f"📝 Trip description: {request.trip_description}")
        print(f"📅 Start date: {request.start_date}")
        print(f"📆 Days: {request.days}")
        print(f"💰 Budget level: {request.budget_level}")
        print(f"🏷️ Trip tags: {request.trip_tags}")
        print(f"🖼️ Image provided: {'Yes' if request.inspiration_image else 'No'}")
        
        # Configure Gemini
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        print(f"🔍 Gemini API Key Status: {'SET' if GEMINI_API_KEY and not GEMINI_API_KEY.startswith('your_') and len(GEMINI_API_KEY) > 20 else 'NOT SET or PLACEHOLDER'}")
        print(f"🔑 Gemini API Key length: {len(GEMINI_API_KEY) if GEMINI_API_KEY else 0}")
        print(f"🔑 Gemini API Key starts with: {GEMINI_API_KEY[:10] if GEMINI_API_KEY else 'NONE'}")
        print(f"🔑 Full Gemini API Key (last 5 chars): {GEMINI_API_KEY[-5:] if GEMINI_API_KEY else 'NONE'}")
        
        if not GEMINI_API_KEY:
            print("❌ ERROR: GEMINI_API_KEY not set")
            raise RuntimeError("GEMINI_API_KEY not set")
        
        if GEMINI_API_KEY.startswith("your_") or len(GEMINI_API_KEY) < 20:
            print("❌ ERROR: GEMINI_API_KEY still contains placeholder value or is too short")
            raise RuntimeError("GEMINI_API_KEY not set (placeholder value detected)")
        
        # Test if the API key is valid by trying to list models
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            print("✅ Gemini configured successfully")
            
            # Test the API key by listing models
            print("🔍 Testing API key validity...")
            models = genai.list_models()
            model_names = [m.name for m in models]
            print(f"✅ API key is valid. Available models: {len(model_names)}")
            if model_names:
                print(f"📋 First few models: {model_names[:3]}")
        except Exception as key_error:
            print(f"❌ API key validation failed: {key_error}")
            raise RuntimeError(f"Invalid Gemini API key: {key_error}")
        
        # Define the model
        model = genai.GenerativeModel("models/gemini-flash-latest")
        print("🤖 Using model: gemini-flash-latest")
        
        # Create system prompt with schema information
        itinerary_schema = """{
            "destination": "string",
            "numDays": "integer",
            "styleKeywords": ["string"],
            "imageMoodSummary": "string or null",
            "days": [
                {
                    "dayNumber": "integer",
                    "date": "string or null",
                    "theme": "string",
                    "summary": "string",
                    "activities": [
                        {
                            "timeOfDay": "morning|afternoon|evening",
                            "title": "string",
                            "description": "string",
                            "location": "string",
                            "category": "string",
                            "estimatedCost": "number",
                            "bookingRequired": "boolean",
                            "latitude": "number or null (approximate GPS latitude of the location)",
                            "longitude": "number or null (approximate GPS longitude of the location)"
                        }
                    ]
                }
            ],
            "meta": {
                "currency": "string",
                "budgetLevel": "string",
                "notes": "string"
            }
        }"""
        
        # Prepare the prompt
        prompt = f"""
You are an AI travel planner. Generate a detailed, realistic travel itinerary as JSON only, matching this exact schema:

{itinerary_schema}

User trip description: {request.trip_description}
Destination: {request.destination}
Start date: {request.start_date or 'Not specified'}
Days: {request.days or 'Not specified'}
Budget level: {request.budget_level or 'Not specified'}
Trip tags: {request.trip_tags}
Image mood hint: {request.inspiration_image and 'Provided (base64 encoded)' or 'Not provided'}

Important instructions:
1. Respond ONLY with valid JSON that matches the schema exactly
2. Do not include any markdown, explanations, or other text
3. Make the itinerary realistic and engaging
4. Ensure all fields are populated appropriately
5. For estimated costs, use reasonable values in the local currency
6. Activities should be appropriate for the destination and trip type
7. Include 2-4 activities per day
8. Use the destination provided above, not the one mentioned in the trip description
9. Generate specific tourist attractions and activities for the given destination
10. Include approximate latitude and longitude coordinates for each activity location
11. If you don't know the exact coordinates, estimate them based on the location name and destination
"""
        
        print("📤 Sending request to Gemini API...")
        print(f"📋 Prompt length: {len(prompt)} characters")
        
        # Generate content with Gemini
        try:
            response = model.generate_content(prompt)
            raw_text = response.text
            print(f"📥 Received response from Gemini API")
            print(f"📏 Response length: {len(raw_text)} characters")
            
            # Show first 500 characters of response for debugging
            print(f"📄 First 500 chars of response: {raw_text[:500]}...")
            
            # Extract JSON from response (in case of extra text)
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
                print("✅ Successfully extracted JSON from response")
            else:
                json_text = raw_text
                print("⚠️ Could not extract JSON, using entire response")
            
            # Show first 500 characters of JSON for debugging
            print(f"🔍 First 500 chars of JSON: {json_text[:500]}...")
            
            # Parse the JSON
            itinerary_dict = json.loads(json_text)
            print("✅ Successfully parsed JSON")
            
            # Fix timeOfDay values if needed
            for day_data in itinerary_dict['days']:
                for activity_data in day_data['activities']:
                    if 'timeOfDay' in activity_data:
                        time_of_day = activity_data['timeOfDay'].lower()
                        if 'morning' in time_of_day:
                            activity_data['timeOfDay'] = 'morning'
                        elif 'evening' in time_of_day or 'night' in time_of_day:
                            activity_data['timeOfDay'] = 'evening'
                        else:
                            # Default to afternoon for any other values (including "late afternoon")
                            activity_data['timeOfDay'] = 'afternoon'
        
            # Convert to Itinerary object
            # Handle nested objects
            days = []
            for day_data in itinerary_dict['days']:
                activities = []
                for activity_data in day_data['activities']:
                    activity = Activity(**activity_data)
                    activities.append(activity)
                
                day_plan = DayPlan(
                    dayNumber=day_data['dayNumber'],
                    date=day_data.get('date'),
                    theme=day_data['theme'],
                    summary=day_data['summary'],
                    activities=activities
                )
                days.append(day_plan)
            
            meta = ItineraryMeta(**itinerary_dict['meta'])
            
            itinerary = Itinerary(
                destination=itinerary_dict['destination'],
                numDays=itinerary_dict['numDays'],
                styleKeywords=itinerary_dict['styleKeywords'],
                imageMoodSummary=itinerary_dict.get('imageMoodSummary'),
                days=days,
                meta=meta
            )
            
            print("=" * 50)
            print("✅ ITINERARY GENERATED SUCCESSFULLY")
            print(f"🌍 Destination: {itinerary.destination}")
            print(f"📅 Number of days: {itinerary.numDays}")
            print(f"🏷️ Style keywords: {itinerary.styleKeywords}")
            print("=" * 50)
            
            return itinerary
            
        except Exception as api_error:
            print(f"❌ Gemini API call failed: {api_error}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Gemini API call failed: {api_error}")
            
    except json.JSONDecodeError as e:
        # Fallback to mock implementation if JSON parsing fails
        print(f"❌ JSON parsing failed: {e}. Using fallback implementation.")
        return _generate_mock_itinerary(request)
    except Exception as e:
        # Check if it's a quota exceeded error
        error_str = str(e).lower()
        if "quota" in error_str or "429" in error_str or "exceeded" in error_str:
            print("❌ Gemini API quota exceeded. Using fallback implementation.")
            print("💡 Solution: Upgrade your Gemini API plan or wait for quota reset.")
            return _generate_mock_itinerary(request)
        else:
            # Fallback to mock implementation for any other errors
            print(f"❌ Gemini API call failed: {e}. Using fallback implementation.")
            import traceback
            traceback.print_exc()
            return _generate_mock_itinerary(request)


def _generate_mock_itinerary(request: TripRequest) -> Itinerary:
    """
    Mock implementation as fallback when Gemini fails.
    """
    # Use the destination from the request, or extract from description if not provided
    destination = request.destination if request.destination else _extract_destination(request.trip_description)
    print(f"📍 Using destination: {destination}")
    
    # Determine number of days
    num_days = request.days or _estimate_days(request.trip_description)
    
    # Determine style keywords from tags and description
    style_keywords = _extract_style_keywords(request.trip_description, request.trip_tags)
    
    # Generate image mood summary if image is provided
    image_mood_summary = None
    if request.inspiration_image:
        image_mood_summary = _interpret_image_mood(request.inspiration_image)
    
    # Generate daily plans
    days = []
    for i in range(num_days):
        day_number = i + 1
        day_plan = _generate_day_plan(day_number, destination, request.trip_tags)
        days.append(day_plan)
    
    # Determine budget level and currency
    budget_level = request.budget_level or "Medium"
    currency = _determine_currency(destination)
    
    # Create metadata
    meta = ItineraryMeta(
        currency=currency,
        budgetLevel=budget_level,
        notes=f"This itinerary was generated using fallback logic based on your request for a {', '.join(style_keywords)} trip to {destination}. Powered by Gemini AI when available."
    )
    
    # Create and return the itinerary
    return Itinerary(
        destination=destination,  # Use the actual destination from user input
        numDays=num_days,
        styleKeywords=style_keywords,
        imageMoodSummary=image_mood_summary,
        days=days,
        meta=meta
    )


def _extract_destination(description: str) -> str:
    """Extract destination from trip description (improved implementation)"""
    # More comprehensive list of destinations
    destinations = [
        "Paris", "Tokyo", "New York", "London", "Rome", "Barcelona", 
        "Bangkok", "Dubai", "Sydney", "Bali", "Hawaii", "Swiss Alps",
        "Amsterdam", "Prague", "Vienna", "Berlin", "Madrid", "Lisbon",
        "Athens", "Istanbul", "Cairo", "Marrakech", "Cape Town", "Santorini",
        "Buenos Aires", "Rio de Janeiro", "Mexico City", "Los Angeles",
        "San Francisco", "Toronto", "Vancouver", "Seoul", "Singapore",
        "Hong Kong", "Shanghai", "Beijing", "Moscow", "Stockholm",
        "Oslo", "Helsinki", "Copenhagen", "Dublin", "Edinburgh", "Andhra Pradesh"
    ]
    
    # Convert description to lowercase for case-insensitive matching
    desc_lower = description.lower()
    
    # First try to find exact matches of destination names
    for dest in destinations:
        if dest.lower() in desc_lower:
            print(f"📍 Found exact destination match: {dest}")
            return dest
    
    # Try partial matching with common variations
    destination_variations = {
        "new york": ["new york", "nyc", "new york city"],
        "los angeles": ["los angeles", "la", "l.a."],
        "san francisco": ["san francisco", "sf", "sfo"],
        "london": ["london", "england", "uk", "united kingdom"],
        "paris": ["paris", "france"],
        "tokyo": ["tokyo", "japan"],
        "sydney": ["sydney", "australia"],
        "rome": ["rome", "italy"],
        "berlin": ["berlin", "germany"],
        "madrid": ["madrid", "spain"]
    }
    
    for dest, variations in destination_variations.items():
        # Capitalize the destination name properly
        proper_dest = dest.title()
        if dest.lower() == "new york":
            proper_dest = "New York"
        elif dest.lower() == "san francisco":
            proper_dest = "San Francisco"
        elif dest.lower() == "los angeles":
            proper_dest = "Los Angeles"
        elif dest.lower() == "london":
            proper_dest = "London"
            
        for variation in variations:
            if variation in desc_lower:
                print(f"📍 Found destination variation match: {proper_dest}")
                return proper_dest
    
    # If still no match, try to extract potential destination words
    # Look for capitalized words that might be cities/countries
    words = description.split()
    for word in words:
        # Remove punctuation
        clean_word = ''.join(c for c in word if c.isalpha())
        # Check if it's a potential destination (starts with capital letter and length > 2)
        if clean_word and clean_word[0].isupper() and len(clean_word) > 2:
            # Check if it's in our destinations list (case insensitive)
            for dest in destinations:
                if dest.lower() == clean_word.lower():
                    print(f"📍 Found capitalized word match: {dest}")
                    return dest
    
    # Default to a more interesting destination than Paris
    print("📍 No destination found, defaulting to Tokyo")
    return "Tokyo"


def _estimate_days(description: str) -> int:
    """Estimate number of days from trip description (improved implementation)"""
    # Look for numbers in the description
    words = description.lower().split()
    
    # First look for explicit day mentions
    for word in words:
        # Remove punctuation
        clean_word = ''.join(c for c in word if c.isdigit() or c == '-')
        if clean_word and clean_word.isdigit():
            num = int(clean_word)
            if 1 <= num <= 30:  # Reasonable trip duration
                return num
    
    # Look for phrases like "5-day trip", "week-long", etc.
    description_lower = description.lower()
    day_phrases = [
        ("week", 7),
        ("weekend", 3),
        ("fortnight", 14),
        ("month", 30)
    ]
    
    for phrase, days in day_phrases:
        if phrase in description_lower:
            return days
    
    # Try to find number words
    number_words = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
        "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15
    }
    
    for word in words:
        clean_word = ''.join(c for c in word if c.isalpha())
        if clean_word in number_words:
            return number_words[clean_word]
    
    # Default to 5 days
    return 5


def _extract_style_keywords(description: str, tags: List[str]) -> List[str]:
    """Extract style keywords from description and tags (improved implementation)"""
    # Combine tags and description keywords
    all_keywords = tags + description.lower().split()
    
    # Style keywords we're looking for
    style_categories = {
        "relaxing": ["relax", "relaxing", "chill", "peaceful", "serene", "calm", "spa", "beach"],
        "adventure": ["adventure", "thrill", "exciting", "explore", "hiking", "trekking", "outdoor"],
        "luxury": ["luxury", "luxurious", "expensive", "high-end", "premium", "five-star"],
        "budget": ["budget", "cheap", "affordable", "low-cost", "economical"],
        "family": ["family", "kids", "children", "parents"],
        "romantic": ["romantic", "couple", "honeymoon", "love", "date"],
        "cultural": ["cultural", "culture", "museum", "art", "heritage", "local"],
        "historical": ["historical", "history", "ancient", "historic", "monument"],
        "beach": ["beach", "coast", "ocean", "sea", "sand", "surf"],
        "mountain": ["mountain", "hills", "peak", "summit", "alpine"],
        "city": ["city", "urban", "metropolitan", "downtown"],
        "nature": ["nature", "wildlife", "forest", "park", "natural"]
    }
    
    found_keywords = []
    
    # Check each category
    for category, keywords in style_categories.items():
        # Check if any keyword from this category is in our input
        for keyword in keywords:
            if keyword in [k.lower() for k in all_keywords]:
                # Capitalize properly
                capitalized = category.capitalize()
                if category == "relaxing":
                    capitalized = "Relaxing"
                elif category == "adventure":
                    capitalized = "Adventure"
                found_keywords.append(capitalized)
                break  # Only add each category once
    
    # Ensure we have at least one keyword
    if not found_keywords:
        found_keywords.append("Cultural")
    
    return found_keywords[:3]  # Limit to 3 keywords


def _interpret_image_mood(image_data: str) -> str:
    """Interpret image mood from base64 image data (mock implementation)"""
    # In a real implementation, this would use computer vision or AI
    # For mocking, we'll generate a deterministic response based on image data
    
    # Hash the image data to get consistent results
    hash_object = hashlib.md5(image_data.encode())
    hex_dig = hash_object.hexdigest()
    
    # Map hash to mood descriptions
    mood_descriptions = [
        "Vibrant and colorful atmosphere",
        "Serene and peaceful setting",
        "Urban and modern landscape",
        "Natural and rustic environment",
        "Luxurious and elegant ambiance",
        "Adventurous and exotic locale"
    ]
    
    # Use first byte of hash to select mood
    mood_index = int(hex_dig[:2], 16) % len(mood_descriptions)
    return mood_descriptions[mood_index]


def _generate_day_plan(day_number: int, destination: str, tags: List[str]) -> DayPlan:
    """Generate a day plan for the itinerary"""
    themes = [
        "Exploring the City",
        "Cultural Immersion",
        "Scenic Adventures",
        "Local Experiences",
        "Historical Journey",
        "Gastronomic Delights"
    ]
    
    theme = themes[(day_number - 1) % len(themes)]
    
    summaries = [
        f"Discover the highlights of {destination} on day {day_number}",
        f"Immerse yourself in the local culture of {destination}",
        f"Experience the natural beauty surrounding {destination}",
        f"Taste the authentic flavors of {destination}",
        f"Uncover the history and heritage of {destination}"
    ]
    
    summary = summaries[(day_number - 1) % len(summaries)]
    
    # Generate activities based on tags and destination
    activities = _generate_activities(day_number, destination, tags)
    
    return DayPlan(
        dayNumber=day_number,
        theme=theme,
        summary=summary,
        activities=activities
    )


def _generate_activities(day_number: int, destination: str, tags: List[str]) -> List[Activity]:
    """Generate activities for a day based on destination and tags"""
    
    # Specific activities for Indian destinations
    if "Karnataka" in destination or "Andhra Pradesh" in destination:
        if "Karnataka" in destination:
            activities = [
                Activity(
                    timeOfDay="morning",
                    title="Visit Mysore Palace",
                    description="Explore the magnificent Mysore Palace, a symbol of the city's rich heritage.",
                    location="Mysore Palace, Mysore",
                    category="Historical Site",
                    estimatedCost=50.0,
                    bookingRequired=False,
                    latitude=12.3051,
                    longitude=76.6555
                ),
                Activity(
                    timeOfDay="afternoon",
                    title="Explore Coorg's Coffee Plantations",
                    description="Take a guided tour of coffee plantations and learn about the coffee-making process.",
                    location="Coorg Coffee Plantations",
                    category="Nature & Adventure",
                    estimatedCost=75.0,
                    bookingRequired=True,
                    latitude=12.3375,
                    longitude=75.8019
                ),
                Activity(
                    timeOfDay="evening",
                    title="Stroll along Lalbagh Botanical Garden",
                    description="Enjoy the beautiful gardens and glass house in this historic botanical garden.",
                    location="Lalbagh Botanical Garden, Bangalore",
                    category="Nature",
                    estimatedCost=30.0,
                    bookingRequired=False,
                    latitude=12.9791,
                    longitude=77.5704
                )
            ]
        else:  # Andhra Pradesh
            activities = [
                Activity(
                    timeOfDay="morning",
                    title="Visit Araku Valley",
                    description="Explore the scenic hill station with coffee plantations and tribal villages.",
                    location="Araku Valley",
                    category="Nature & Adventure",
                    estimatedCost=80.0,
                    bookingRequired=True,
                    latitude=18.3991,
                    longitude=83.3434
                ),
                Activity(
                    timeOfDay="afternoon",
                    title="Tour Amaravati Buddhist Stupa",
                    description="Discover the ancient Buddhist stupa and archaeological museum.",
                    location="Amaravati Buddhist Stupa",
                    category="Historical Site",
                    estimatedCost=40.0,
                    bookingRequired=False,
                    latitude=16.5333,
                    longitude=80.3667
                ),
                Activity(
                    timeOfDay="evening",
                    title="Relax at Rushikonda Beach",
                    description="Enjoy the sunset and water sports at this pristine beach in Visakhapatnam.",
                    location="Rushikonda Beach, Visakhapatnam",
                    category="Beach & Recreation",
                    estimatedCost=25.0,
                    bookingRequired=False,
                    latitude=17.7667,
                    longitude=83.3333
                )
            ]
    else:
        # Base activities for all other trips
        activities = [
            Activity(
                timeOfDay="morning",
                title=f"Morning Exploration in {destination}",
                description=f"Start your day with a guided tour of {destination}'s iconic landmarks.",
                location=f"Downtown {destination}",
                category="Sightseeing",
                estimatedCost=0.0,
                bookingRequired=False
            ),
            Activity(
                timeOfDay="afternoon",
                title="Local Cuisine Experience",
                description=f"Enjoy a traditional meal at a renowned local restaurant.",
                location=f"Local Restaurant in {destination}",
                category="Food & Drink",
                estimatedCost=25.0,
                bookingRequired=True
            ),
            Activity(
                timeOfDay="evening",
                title="Evening Entertainment",
                description="Experience the nightlife and entertainment options.",
                location=f"{destination} Entertainment District",
                category="Entertainment",
                estimatedCost=30.0,
                bookingRequired=False
            )
        ]
    
    # Add tag-specific activities
    tag_activities = []
    
    if "Adventure" in tags:
        tag_activities.append(Activity(
            timeOfDay="morning",
            title="Adventure Activity",
            description="Thrilling outdoor adventure experience.",
            location=f"{destination} Adventure Park",
            category="Adventure",
            estimatedCost=75.0,
            bookingRequired=True
        ))
    
    if "Relaxing" in tags:
        tag_activities.append(Activity(
            timeOfDay="afternoon",
            title="Spa & Wellness",
            description="Relaxing spa treatment and wellness session.",
            location=f"Luxury Spa in {destination}",
            category="Wellness",
            estimatedCost=120.0,
            bookingRequired=True
        ))
    
    if "Romantic" in tags:
        tag_activities.append(Activity(
            timeOfDay="evening",
            title="Romantic Dinner",
            description="Intimate dinner for two at a romantic venue.",
            location=f"Romantic Restaurant in {destination}",
            category="Dining",
            estimatedCost=150.0,
            bookingRequired=True
        ))
    
    # Combine base and tag-specific activities
    all_activities = activities + tag_activities
    
    # Return activities appropriate for this day
    start_idx = (day_number - 1) * 2
    end_idx = start_idx + 3
    return all_activities[start_idx:end_idx]


def _determine_currency(destination: str) -> str:
    """Determine currency based on destination"""
    currency_map = {
        "Paris": "EUR",
        "Tokyo": "JPY",
        "New York": "USD",
        "London": "GBP",
        "Rome": "EUR",
        "Barcelona": "EUR",
        "Bangkok": "THB",
        "Dubai": "AED",
        "Sydney": "AUD",
        "Bali": "IDR",
        "Hawaii": "USD"
    }
    
    return currency_map.get(destination, "USD")