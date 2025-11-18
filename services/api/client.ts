// File: services/api/client.ts
import axios, { AxiosInstance } from 'axios';
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
});

// ✅ Development mode logging
if (__DEV__) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 AthlosCore API Client');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Environment: DEVELOPMENT');
  console.log('API Base URL:', API_CONFIG.BASE_URL);
  console.log('Platform:', Platform.OS);
  console.log('');
  console.log('SSL Configuration:');
  console.log('  ✅ Handled by Expo via app.config.js');
  console.log('  ✅ iOS: NSExceptionDomains configured');
  console.log('  ✅ Android: usesCleartextTraffic enabled');
  console.log('═══════════════════════════════════════════════════════');
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (__DEV__) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        hasAuth: !!token,
      });
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
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ API ERROR');
      console.error('═══════════════════════════════════════════════════════');

      // 🔍 DETAILED ERROR DEBUGGING
      console.error('🔍 Error Details:');
      console.error('  • error.code:', error.code);
      console.error('  • error.message:', error.message);
      console.error('  • error.name:', error.name);
      console.error('  • Has response:', !!error.response);
      console.error('  • Has request:', !!error.request);

      // Log the full error object structure
      if (error.toJSON) {
        console.error('  • Full error (JSON):', JSON.stringify(error.toJSON(), null, 2));
      }

      // Check for underlying native error
      if (error.cause) {
        console.error('  • Underlying cause:', error.cause);
      }

      console.error('═══════════════════════════════════════════════════════');
    }

    // ✅ SSL Error Detection
    const isSSLError = 
      error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      error.code === 'CERT_HAS_EXPIRED' ||
      error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      error.message?.toLowerCase().includes('certificate') ||
      error.message?.toLowerCase().includes('ssl');

    if (isSSLError) {
      console.error('🔒 SSL Certificate Error Detected');
      console.error('Platform:', Platform.OS);
      console.error('');
      console.error('EXPO TROUBLESHOOTING:');
      console.error('1. Check app.config.js has correct configuration');
      console.error('2. Run: npx expo prebuild --clean');
      console.error('3. Rebuild: npx expo run:ios or npx expo run:android');
      console.error('4. If using Expo Go, SSL exceptions may not work');
      console.error('   → Use Development Build instead');
      
      error.userMessage = Platform.select({
        ios: 'SSL Error on iOS. Ensure app.config.js has NSExceptionDomains configured and rebuild with "npx expo run:ios"',
        android: 'SSL Error on Android. Ensure app.config.js has usesCleartextTraffic enabled and rebuild with "npx expo run:android"',
        default: 'SSL Certificate Error',
      });
    }

    // Network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error');
      console.error('URL:', `${error.config?.baseURL}${error.config?.url}`);
      error.userMessage = 'Cannot connect to server. Check your connection.';
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      console.error('⏱️ Timeout Error');
      error.userMessage = 'Server took too long to respond.';
    }

    // HTTP status errors
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      switch (error.response.status) {
        case 401:
          await AsyncStorage.removeItem('auth_token');
          error.userMessage = error.response.data || 'Invalid email or password';
          break;
        case 409:
          error.userMessage = error.response.data?.error || 'User already exists';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again.';
          break;
      }
    }

    if (__DEV__) {
      console.error('═══════════════════════════════════════════════════════');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;