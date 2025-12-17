import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // User is logged in, redirect to main app
        router.replace('/(main)/home');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  return <Stack />;
}