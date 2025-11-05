import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add detailed logging
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers,
    });

    // Disable SSL verification in development
    if (!API_CONFIG.SSL_VERIFY) {
      console.warn('⚠️ SSL verification disabled for development');
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
      method: error.config?.method?.toUpperCase(),
      requestData: error.config?.data,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
      console.log('🔐 Token cleared due to 401 error');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;