import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ItineraryScreen() {
  const { itinerary } = useLocalSearchParams();
  const router = useRouter();
  
  // Parse the itinerary data
  const itineraryData = itinerary ? JSON.parse(itinerary as string) : null;

  if (!itineraryData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load itinerary</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.backButtonText}>Back to Planner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract locations for map
  const locations = [];
  if (itineraryData.days) {
    itineraryData.days.forEach((day: any) => {
      if (day.activities) {
        day.activities.forEach((activity: any) => {
          // Only add locations with valid coordinates
          if (activity.latitude && activity.longitude) {
            locations.push({
              name: activity.location,
              day: day.dayNumber,
              latitude: activity.latitude,
              longitude: activity.longitude
            });
          }
        });
      }
    });
  }

  return (
    <LinearGradient
      colors={['#1a0033', '#330066', '#0066cc', '#00cc99']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{itineraryData.destination}</Text>
        <Text style={styles.subtitle}>{itineraryData.numDays}-day trip • {itineraryData.budgetLevel} budget</Text>
        
        {/* Map View */}
        {Platform.OS !== 'web' ? (
          <View style={styles.mapContainerPlaceholder}>
            <Text style={styles.subtitle}>Map view available on mobile app</Text>
          </View>
        ) : (
          <View style={styles.mapContainerPlaceholder}>
            <Text style={styles.subtitle}>Map view not available on web</Text>
          </View>
        )}
        
        {/* Itinerary Details */}
        {itineraryData.days && itineraryData.days.map((day: any) => {
          const [dayExpanded, setDayExpanded] = useState<boolean>(true);
          
          const toggleDay = () => {
            setDayExpanded(!dayExpanded);
          };
          
          return (
            <View key={day.dayNumber} style={styles.dayContainer}>
              <TouchableOpacity 
                style={styles.dayHeaderContainer}
                onPress={toggleDay}
              >
                <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                <Text style={styles.dayToggleIcon}>{dayExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              <Text style={styles.dayDate}>{day.date}</Text>
              
              {dayExpanded && (
                <>
                  {/* Show plan glimpse when day is expanded */}
                  <View style={styles.planGlimpse}>
                    <Text style={styles.glimpseText}>📋 {day.activities?.length || 0} activities planned</Text>
                    <Text style={styles.glimpseText}>💰 Total estimate: ₹{Math.round(day.activities?.reduce((sum: number, activity: any) => sum + (activity.estimatedCost || 0), 0) || 0)}</Text>
                  </View>
                  
                  {/* Group activities by time of day */}
                  {['morning', 'afternoon', 'evening'].map((timeOfDay) => {
                    const activitiesForTime = day.activities?.filter((activity: any) => activity.timeOfDay === timeOfDay) || [];
                    if (activitiesForTime.length === 0) return null;
                    
                    return (
                      <View key={timeOfDay} style={styles.timeSection}>
                        <Text style={styles.timeHeader}>{timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}</Text>
                        {activitiesForTime.map((activity: any, index: number) => (
                          <View key={index} style={styles.activityCard}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <View style={styles.activityInfo}>
                              <Text style={styles.locationText}>📍 {activity.location}</Text>
                              {activity.estimatedCost && (
                                <Text style={styles.costText}>💰 ₹{Math.round(activity.estimatedCost)}</Text>
                              )}
                            </View>
                            <Text style={styles.descriptionText}>{activity.description}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          );
        })}
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.backButtonText}>Plan Another Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 50,
  },
  mapContainerPlaceholder: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1e1e3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    marginBottom: 15,
  },
  dayHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayToggleIcon: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  dayDate: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  planGlimpse: {
    backgroundColor: '#2d2d4d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  glimpseText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 5,
  },

  timeSection: {
    marginBottom: 20,
  },

  timeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    textTransform: 'capitalize',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#2d2d4d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  costText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});