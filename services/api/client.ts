// File: services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '@/config/api';

// ✅ Expo handles SSL at the native level via app.config.js
// No additional SSL configuration needed in JavaScript
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CRITICAL: Add these for React Native
  validateStatus: (status) => status < 500, // Don't throw on 4xx errors
});

// ✅ Development mode logging
if (__DEV__) {
  console.log('🚀 API Client initialized:', API_CONFIG.BASE_URL);
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log concise error
    if (__DEV__) {
      console.error(`❌ ${error.code || 'ERROR'}: ${error.message} - ${error.config?.url}`);
      if (error.response) {
        console.error(`   Status ${error.response.status}:`, error.response.data);
      }
    }

    // Set user-friendly error messages
    const isSSLError =
      error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      error.code === 'CERT_HAS_EXPIRED' ||
      error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
      error.message?.toLowerCase().includes('certificate') ||
      error.message?.toLowerCase().includes('ssl') ||
      error.message?.toLowerCase().includes('tls');

    if (isSSLError) {
      error.userMessage = Platform.select({
        ios: 'SSL Error. Rebuild with: npx expo run:ios',
        android: 'SSL Error. Check network_security_config.xml',
        default: 'SSL Certificate Error',
      });
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      error.userMessage = 'Cannot connect to server.';
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      error.userMessage = 'Server took too long to respond.';
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          await AsyncStorage.removeItem('auth_token');
          error.userMessage = error.response.data?.error || 'Invalid email or password';
          break;
        case 409:
          error.userMessage = error.response.data?.error || 'User already exists';
          break;
        case 500:
          error.userMessage = error.response.data?.error || 'Server error. Please try again.';
          break;
        default:
          error.userMessage = error.response.data?.error || `Error: ${error.response.status}`;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;