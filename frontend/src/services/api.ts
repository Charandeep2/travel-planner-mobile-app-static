import type { TripRequest, Itinerary } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Store token in memory
let authToken: string | null = null;

// Set the authentication token
export function setAuthToken(token: string | null) {
  authToken = token;
}

// Get the authentication token
export function getAuthToken(): string | null {
  return authToken;
}

export async function requestOtp(email: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // No response body expected for successful OTP request
    return;
  } catch (error) {
    console.error('Error requesting OTP:', error);
    throw error;
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

export async function generateItinerary(payload: TripRequest): Promise<Itinerary> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Itinerary = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}