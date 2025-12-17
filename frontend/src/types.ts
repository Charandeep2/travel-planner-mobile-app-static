export type Activity = {
  timeOfDay: "morning" | "afternoon" | "evening";
  title: string;
  description: string;
  location: string;
  category: string;
  estimatedCost: number;
  bookingRequired: boolean;
};

export type DayPlan = {
  dayNumber: number;
  date?: string;
  theme: string;
  summary: string;
  activities: Activity[];
};

export type Itinerary = {
  destination: string;
  numDays: number;
  styleKeywords: string[];
  imageMoodSummary?: string;
  days: DayPlan[];
  meta: {
    currency: string;
    budgetLevel: string;
    notes: string;
  };
};

export type TripRequest = {
  trip_description: string;
  start_date?: string;
  days?: number;
  budget_level?: string;
  trip_tags: string[];
  inspiration_image?: string; // base64 or URL
};