import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('');
  const [tripType, setTripType] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateItinerary = async () => {
    if (!tripDescription) {
      Alert.alert('Error', 'Please provide a trip description');
      return;
    }

    setLoading(true);
    try {
      // Generate itinerary
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
      const requestData: any = {
        trip_description: tripDescription,
        trip_tags: tripType ? [tripType, 'tourism'] : ['tourism']
      };
      
      // Add optional fields if provided
      if (startDate) requestData.start_date = startDate;
      if (days) requestData.days = parseInt(days);
      if (budgetLevel) requestData.budget_level = budgetLevel;
      
      const response = await axios.post(`${apiUrl}/api/generate-itinerary`, requestData);

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
          <Text style={styles.label}>Describe your trip *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about your ideal vacation..."
            value={tripDescription}
            onChangeText={setTripDescription}
            multiline
            numberOfLines={4}
          />
          
          <Text style={styles.label}>Start Date (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />
          
          <Text style={styles.label}>Number of Days (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="How many days?"
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Budget Level (Optional)</Text>
          <View style={styles.budgetContainer}>

            {['low', 'medium', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.budgetOption,
                  budgetLevel === level && styles.selectedBudget
                ]}
                onPress={() => setBudgetLevel(budgetLevel === level ? '' : level)}
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
          
          <Text style={styles.label}>Trip Type (Optional)</Text>
          <View style={styles.tripTypeContainer}>
            {['adventure', 'relaxation', 'culture', 'food', 'business', 'family', 'luxury', 'budget'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.tripTypeOption,
                  tripType === type && styles.selectedTripType
                ]}
                onPress={() => setTripType(tripType === type ? '' : type)}
              >
                <Text style={[
                  styles.tripTypeText,
                  tripType === type && styles.selectedTripTypeText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
  tripTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  tripTypeOption: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#1e1e3a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectedTripType: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tripTypeText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  selectedTripTypeText: {
    color: '#fff',
    fontWeight: '600',
  },
});