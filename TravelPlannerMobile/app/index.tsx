import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate directly to the main app without authentication
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agentic Travel Planner</Text>
      <Text style={styles.subtitle}>AI-Powered Travel Planning</Text>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Plan your perfect trip with our AI-powered travel assistant. 
          Get personalized itineraries based on your preferences.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});