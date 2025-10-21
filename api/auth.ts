import apiClient, { ApiResponse } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name: string;
  last_name: string;
  phone_number?: string;
  resident_state: string;
  zip_code: string;
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  resident_state: string;
  zip_code: string;
  is_admin?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserData;
}

/**
 * Authentication API functions
 */
export class AuthAPI {
  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.access_token);
    }

    return response;
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<ApiResponse<UserData>> {
    return apiClient.post<UserData>('/auth/register', data);
  }

  /**
   * Logout user - clears local tokens immediately, backend notification is best-effort
   */
  static async logout(): Promise<void> {
    // Clear tokens immediately (don't wait for backend)
    await apiClient.clearAuthToken();
    
    // Try to notify backend (but don't block on it)
    try {
      // Use a short timeout just for logout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      await fetch(`${(apiClient as any).baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }).catch(() => {
        // Silently ignore - user is logged out locally anyway
        console.log('Backend logout notification failed (ignored)');
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      // Ignore errors - user is already logged out locally
      console.log('Logout notification skipped:', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });

    if (response.success && response.data) {
      // Update stored tokens
      await apiClient.setAuthToken(response.data.access_token);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<UserData>> {
    return apiClient.get<UserData>('/auth/me');
  }

  /**
   * Check if user has valid authentication token
   */
  static async isAuthenticated(): Promise<boolean> {
    return apiClient.isAuthenticated();
  }

  /**
   * Get stored authentication token
   */
  static async getToken(): Promise<string | null> {
    return (apiClient as any).getAuthToken();
  }

  /**
   * Validate current session
   */
  static async validateSession(): Promise<boolean> {
    const response = await this.getProfile();
    return response.success;
  }
}
