import React, { useEffect, useRef, useState } from 'react';
import type { Itinerary } from '../types';

// Simple geocoding cache to avoid repeated requests
const geocodeCache: Record<string, { lat: number; lng: number }> = {};

// Simple geocoding function using Nominatim (free geocoding service)
const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
  // Check cache first
  if (geocodeCache[locationName]) {
    return geocodeCache[locationName];
  }
  
  try {
    // Use Nominatim for geocoding (free service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
      {
        headers: {
          'User-Agent': 'AgenticTravelPlanner/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      
      // Cache the result
      geocodeCache[locationName] = result;
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error for location:', locationName, error);
    return null;
  }
};

// Dynamically import leaflet only on client side
const MapView: React.FC<{ itinerary: Itinerary }> = ({ itinerary }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && mapRef.current) {
      // Load leaflet dynamically
      Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css')
      ]).then(async ([L]) => {
        // Ensure we have a valid default export
        const Leaflet = L.default || L;
        
        // Clean up any existing map
        if (mapRef.current) {
          const container = mapRef.current;
          Object.keys(container).forEach(key => {
            if (key.startsWith('leaflet')) {
              delete (container as any)[key];
            }
          });
        }

        // Check if itinerary is valid
        if (!itinerary || !itinerary.days || !mapRef.current) {
          setLoading(false);
          return;
        }

        try {
          // Create map
          const map = Leaflet.map(mapRef.current).setView([20, 0], 2);
          
          // Add tile layer
          Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Process locations with real geocoding
          
          // Collect all unique locations
          const uniqueLocations: { name: string; day: number }[] = [];
          itinerary.days.forEach(day => {
            if (day.activities) {
              day.activities.forEach(activity => {
                // Check if we already have this location
                const existingLocation = uniqueLocations.find(loc => loc.name.toLowerCase() === activity.location.toLowerCase());
                if (!existingLocation) {
                  uniqueLocations.push({
                    name: activity.location,
                    day: day.dayNumber
                  });
                }
              });
            }
          });
          
          // Geocode all locations
          const geocodedLocations = await Promise.all(
            uniqueLocations.map(async (loc) => {
              const coords = await geocodeLocation(loc.name);
              if (coords) {
                return {
                  name: loc.name,
                  day: loc.day,
                  lat: coords.lat,
                  lng: coords.lng
                };
              }
              return null;
            })
          );
          
          // Filter out failed geocodes
          const validLocations = geocodedLocations.filter((loc): loc is NonNullable<typeof loc> => loc !== null);
          
          // Add markers
          validLocations.forEach(location => {
            const marker = Leaflet.marker([location.lat, location.lng]).addTo(map);
            const popupContent = `<div><strong>${location.name}</strong><br/>Day: ${location.day}</div>`;
            marker.bindPopup(popupContent);
          });
          
          // Fit bounds to show all markers
          if (validLocations.length > 0) {
            const bounds = Leaflet.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            // If no locations found, center on the first activity location or default
            if (uniqueLocations.length > 0) {
              // Try to geocode the first location as a fallback
              const firstLocCoords = await geocodeLocation(uniqueLocations[0].name);
              if (firstLocCoords) {
                map.setView([firstLocCoords.lat, firstLocCoords.lng], 10);
              }
            }
          }
          
          setLoading(false);

          // Cleanup
          return () => {
            map.remove();
          };
        } catch (error) {
          console.error('Error initializing map:', error);
          setLoading(false);
        }
      }).catch(error => {
        console.error('Error loading leaflet:', error);
        setLoading(false);
      });
    }
  }, [itinerary]);

  // Don't render if no itinerary
  if (!itinerary) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="gradient-text-futuristic mb-3 text-xl">Trip Map</h3>
      <div 
        ref={mapRef} 
        style={{ height: '400px', borderRadius: '0.75rem', overflow: 'hidden' }}
        className="border"
      >
        {loading && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            background: 'rgba(15, 15, 35, 0.6)',
            color: '#94a3b8'
          }}>
            Loading map...
          </div>
        )}
      </div>
      <div className="mt-3 text-sm" style={{ color: '#94a3b8' }}>
        <p>Locations visited during your trip are marked on the map.</p>
      </div>
    </div>
  );
};

export default MapView;