import React from 'react';
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
          onPress={() => router.replace('/(main)/home')}
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
          locations.push({
            name: activity.location,
            day: day.dayNumber,
            latitude: activity.latitude || 0,
            longitude: activity.longitude || 0
          });
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
        {itineraryData.days && itineraryData.days.map((day: any) => (
          <View key={day.dayNumber} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
            <Text style={styles.dayDate}>{day.date}</Text>
            
            {day.activities && day.activities.map((activity: any, index: number) => (
              <View key={index} style={styles.activityContainer}>
                <Text style={styles.timeText}>{activity.time}</Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.locationText}>{activity.location}</Text>
                  <Text style={styles.descriptionText}>{activity.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/(main)/home')}
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
    padding: 15,
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  dayDate: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 15,
  },
  activityContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  timeText: {
    width: 80,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 3,
  },
  locationText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 5,
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