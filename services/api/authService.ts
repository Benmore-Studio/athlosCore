// File: services/api/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

const AUTH_TOKEN_KEY = 'auth_token'; // ✅ Match the key used in apiClient
const USER_DATA_KEY = 'userData';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string; // ✅ API expects "full_name" not "name"
  org_name?: string; // ✅ Optional: create new org
  org_ids?: string[]; // ✅ Optional: join existing orgs
}

// ✅ API returns ONLY token for login
interface LoginResponse {
  token: string;
}

// ✅ API returns user_id, email, organizations for register
interface RegisterResponse {
  user_id: string;
  email: string;
  organizations: string[];
}

// ✅ Organization structure from API
interface Organization {
  org_id: string;
  name: string;
  created_at: string;
  last_updated_at: string;
}

// ✅ Org name check response
interface OrgNameCheckResponse {
  exists: boolean;
  organization: {
    org_id: string;
    name: string;
  } | null;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      console.log('🔐 Calling login API...');
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
      
      // ✅ API returns { "token": "..." } ONLY
      const data: LoginResponse = response.data;
      
      // ✅ Store token
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
      
      // ✅ Store email as basic user data
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({ 
        email: credentials.email 
      }));
      
      console.log('✅ Login successful, token stored');
      return data.token;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      // ✅ API returns "Invalid email or password" as string for 401
      if (error.response?.status === 401) {
        throw new Error(error.response?.data || 'Invalid email or password');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      console.log('📝 Calling register API...');
      
      // ✅ API expects: full_name, email, password, org_name?, org_ids?
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, credentials);
      
      // ✅ API returns { user_id, email, organizations }
      const data: RegisterResponse = response.data;
      
      // ✅ Store user data (NO TOKEN returned from register)
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
      
      console.log('✅ Registration successful');
      console.log('ℹ️ Note: User must login separately after registration');
      return data;
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data || error.message);
      
      // ✅ Handle 409 Conflict - email already exists
      if (error.response?.status === 409) {
        throw new Error('User with this email already exists');
      }
      
      // ✅ Handle 500 error (noted in API contract)
      if (error.response?.status === 500) {
        throw new Error('Server error during registration. Please try again or contact support.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');

      // Get all keys to check what we're clearing
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(key =>
        key === AUTH_TOKEN_KEY ||
        key === USER_DATA_KEY ||
        key === 'current_org_id'
      );

      if (__DEV__) {
        console.log('🔍 Found auth keys to clear:', authKeys);
      }

      // Clear auth-related data
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, 'current_org_id']);

      console.log('✅ Logout successful - auth data cleared');
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Force clear even on error
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, 'current_org_id']);
      } catch (forceError) {
        console.error('❌ Failed to force clear auth data:', forceError);
      }

      throw error;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const hasToken = !!token;
      console.log('🔍 Has token:', hasToken);
      return hasToken;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return false;
    }
  },

  async getCurrentUser(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Retrieved user:', user);
        return user;
      }
      console.log('👤 No user data found');
      return null;
    } catch (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('❌ Get token error:', error);
      return null;
    }
  },

  // ✅ Check if organization exists by name
  // API: POST /auth/check-org-name?name={org_name}
  // Returns: { exists: boolean, organization: {...} | null }
  async checkOrgName(orgName: string): Promise<OrgNameCheckResponse> {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.CHECK_ORG_NAME}?name=${encodeURIComponent(orgName)}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Check org name error:', error.response?.data || error.message);
      
      // ✅ 404 means organization doesn't exist (available)
      if (error.response?.status === 404) {
        return { exists: false, organization: null };
      }
      
      // ✅ 500 error noted in API contract
      if (error.response?.status === 500) {
        throw new Error('Server error checking organization name. Please try again.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to check organization name');
    }
  },

  // ✅ Get list of all organizations
  // API: GET /auth/orgs-list
  // Returns: Array of organizations
  async getOrgsList(): Promise<Organization[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ORGS_LIST);
      
      // ✅ API returns array directly (not wrapped in .organizations)
      return response.data;
    } catch (error: any) {
      console.error('❌ Get orgs list error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch organizations');
    }
  },

  // ✅ Clear all auth data (for debugging)
  async clearAllAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ All auth data cleared');
    } catch (error) {
      console.error('❌ Clear auth data error:', error);
    }
  },
};

export default authService;