import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [tripDescription, setTripDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateItinerary = async () => {
    if (!tripDescription || !destination || !days) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Generate itinerary
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/generate-itinerary`, {
        trip_description: tripDescription,
        destination: destination,
        days: parseInt(days),
        budget_level: budgetLevel,
        trip_tags: ['adventure', 'culture'],
        start_date: new Date().toISOString().split('T')[0]
      });

      if (response.data) {
        // Navigate to itinerary screen with data
        router.push({
          pathname: '/itinerary',
          params: { itinerary: JSON.stringify(response.data) }
        });
      }
    } catch (error: any) {
      console.error('Itinerary generation error:', error);
      Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={['#1a0033', '#330066', '#0066cc', '#00cc99']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Travel Planner</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleGoBack}>
            <Text style={styles.logoutText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>AI-Powered Travel Planning</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Trip Description *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your dream trip..."
            value={tripDescription}
            onChangeText={setTripDescription}
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.label}>Destination *</Text>
          <TextInput
            style={styles.input}
            placeholder="Where do you want to go?"
            value={destination}
            onChangeText={setDestination}
          />
          
          <Text style={styles.label}>Number of Days *</Text>
          <TextInput
            style={styles.input}
            placeholder="How many days?"
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Budget Level</Text>
          <View style={styles.budgetContainer}>
            {['low', 'medium', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.budgetOption,
                  budgetLevel === level && styles.selectedBudget
                ]}
                onPress={() => setBudgetLevel(level)}
              >
                <Text style={[
                  styles.budgetText,
                  budgetLevel === level && styles.selectedBudgetText
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.buttonDisabled]} 
            onPress={handleGenerateItinerary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Itinerary</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#6366f1',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#cbd5e1',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1e1e3a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: '#1e1e3a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    height: 100,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  budgetOption: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1e1e3a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedBudget: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  budgetText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  selectedBudgetText: {
    color: '#fff',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#4f46e5',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});