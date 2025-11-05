// File: services/api/userService.ts
import apiClient from './client';
import offlineApiService from './offlineApiService';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  role?: string;
  org_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  phone?: string;
}

class UserService {
  /**
   * Get current user profile with offline support
   */
  async getProfile(): Promise<UserProfile> {
    const cacheKey = 'user_profile';
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get<UserProfile>('/users/profile');
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 24 * 60 * 60 * 1000 // 24 hours cache (profile doesn't change often)
      }
    );
  }

  /**
   * Update user profile
   * Note: Clears profile cache after update
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/profile', data);
    
    // Clear profile cache to force fresh fetch
    await offlineApiService.clearCache('user_profile');
    
    return response.data;
  }

  /**
   * Get user by ID with offline support
   */
  async getUserById(userId: string): Promise<UserProfile> {
    const cacheKey = `user_${userId}`;
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get<UserProfile>(`/users/${userId}`);
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 12 * 60 * 60 * 1000 // 12 hours cache
      }
    );
  }

  /**
   * Delete user account
   * Note: Clears all user-related caches
   */
  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/profile');
    
    // Clear all user-related caches
    await offlineApiService.clearCache('user_profile');
    await offlineApiService.clearCache('user_preferences');
  }

  /**
   * Change password
   * Note: This doesn't need caching as it's a write-only operation
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * Upload avatar
   * Note: Clears profile cache after upload
   */
  async uploadAvatar(imageUri: string): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    const response = await apiClient.post<{ avatar_url: string }>(
      '/users/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Clear profile cache to show new avatar
    await offlineApiService.clearCache('user_profile');

    return response.data;
  }

  /**
   * Get user preferences with offline support
   */
  async getPreferences(): Promise<Record<string, any>> {
    const cacheKey = 'user_preferences';
    
    return offlineApiService.fetchWithCache(
      async () => {
        const response = await apiClient.get<Record<string, any>>('/users/preferences');
        return response.data;
      },
      { 
        key: cacheKey,
        expiryMs: 7 * 24 * 60 * 60 * 1000 // 7 days cache (preferences rarely change)
      }
    );
  }

  /**
   * Update user preferences
   * Note: Clears preferences cache after update
   */
  async updatePreferences(preferences: Record<string, any>): Promise<Record<string, any>> {
    const response = await apiClient.put<Record<string, any>>('/users/preferences', preferences);
    
    // Clear preferences cache
    await offlineApiService.clearCache('user_preferences');
    
    return response.data;
  }
}

export default new UserService();