import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  org_name?: string;
  org_ids?: string[];
}

export interface Organization {
  org_id: string;
  name: string;
  created_at: string;
  last_updated_at: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    const { token } = response.data;
    await AsyncStorage.setItem('auth_token', token);
    return token;
  }

  async register(data: RegisterData): Promise<{ user_id: string; email: string; organizations: string[] }> {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  }

  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get(API_ENDPOINTS.ORGS_LIST);
    return response.data;
  }

  async checkOrgName(name: string): Promise<{ exists: boolean; organization?: Organization }> {
    const response = await apiClient.get(`${API_ENDPOINTS.CHECK_ORG_NAME}?name=${encodeURIComponent(name)}`);
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

export default new AuthService();