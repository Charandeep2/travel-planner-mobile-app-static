from pydantic import BaseModel
from typing import List, Optional, Literal


class Activity(BaseModel):
    timeOfDay: Literal["morning", "afternoon", "evening"]
    title: str
    description: str
    location: str
    category: str
    estimatedCost: float
    bookingRequired: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DayPlan(BaseModel):
    dayNumber: int
    date: Optional[str] = None
    theme: str
    summary: str
    activities: List[Activity]


class ItineraryMeta(BaseModel):
    currency: str
    budgetLevel: str
    notes: str


class Itinerary(BaseModel):
    destination: str
    numDays: int
    styleKeywords: List[str]
    imageMoodSummary: Optional[str] = None
    days: List[DayPlan]
    meta: ItineraryMeta


class TripRequest(BaseModel):
    trip_description: str
    destination: Optional[str] = None
    start_date: Optional[str] = None
    days: Optional[int] = None
    budget_level: Optional[str] = None
    trip_tags: List[str] = []
    inspiration_image: Optional[str] = None  # base64 or URL