import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Use the actual backend server URL
    // In production, this should be loaded from environment variables
    // For development with local backend
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Set the base URL for API calls
   */
  setBaseURL(url: string) {
    this.baseURL = url;
  }

  /**
   * Get stored authentication token from Zustand store (single source of truth)
   */
  private getAuthToken(): string | null {
    try {
      // Import Zustand store dynamically to avoid circular dependencies
      const { useAppStore } = require('../store');
      const token = useAppStore.getState().authToken;
      
      // Debug logging (remove in production)
      if (!token) {
        console.log('🔑 Token check - Zustand: MISSING!');
      }
      
      return token || null;
    } catch (error) {
      console.warn('❌ Failed to get auth token from store:', error);
      return null;
    }
  }

  /**
   * Remove authentication tokens from storage
   */
  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('refresh_token');
      console.log('✅ Refresh token cleared from AsyncStorage');
      
      // Clear from Zustand store will be handled by logout action
    } catch (error) {
      console.error('Failed to clear refresh token:', error);
    }
  }

  /**
   * Subscribe to token refresh completion
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token refresh completes
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Attempt to refresh the access token
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve) => {
        this.subscribeTokenRefresh((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('⚠️ No refresh token available');
        this.isRefreshing = false;
        return null;
      }

      console.log('🔄 Attempting to refresh access token...');

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access_token;
        
        // Update Zustand store with new token
        const { useAppStore } = require('../store');
        useAppStore.setState({
          authToken: newAccessToken,
          isAuthenticated: true,
        });
        
        // Update refresh token if provided
        if (data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }

        console.log('✅ Token refreshed successfully, new token:', newAccessToken.substring(0, 20) + '...');
        this.isRefreshing = false;
        this.onTokenRefreshed(newAccessToken);
        return newAccessToken;
      } else {
        console.log('❌ Token refresh failed:', response.status);
        this.isRefreshing = false;
        
        // Clear auth state on refresh failure
        const { useAppStore } = require('../store');
        useAppStore.setState({
          authToken: null,
          isAuthenticated: false,
          user: null,
        });
        
        await this.clearAuthToken();
        return null;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.isRefreshing = false;
      return null;
    }
  }

  /**
   * Build headers with authentication if token exists
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response and convert to standardized format
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        return {
          success: true,
          data,
          status: response.status,
        };
      } else {
        // FastAPI returns errors in 'detail' field, but also check for 'message' and 'error'
        const errorMessage = data?.detail || data?.message || data?.error || `HTTP ${response.status}`;
        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        status: response.status,
      };
    }
  }

  /**
   * Generic request method with timeout support and automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const REQUEST_TIMEOUT = 30000; // 30 seconds timeout
    const MAX_RETRIES = 1; // Only retry once for token refresh

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = this.buildHeaders(options.headers);

      console.log(`🌐 API ${options.method || 'GET'} ${url}`);
      if (options.body && options.body !== '{}') {
        try {
          console.log('📤 Request body:', JSON.parse(options.body as string));
        } catch (e) {
          // Ignore parse errors for logging
        }
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`📥 Response status: ${response.status}`);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && retryCount < MAX_RETRIES && endpoint !== '/auth/refresh') {
          console.log('🔐 Unauthorized - attempting token refresh...');
          
          const newToken = await this.refreshAccessToken();
          
          if (newToken) {
            // Retry the request with new token
            console.log('🔄 Retrying request with new token...');
            return this.request<T>(endpoint, options, retryCount + 1);
          } else {
            // Token refresh failed - return unauthorized error
            return {
              success: false,
              error: 'Session expired. Please sign in again.',
              status: 401,
            };
          }
        }

        return this.handleResponse<T>(response);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout specifically
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Request timeout after 30 seconds');
          return {
            success: false,
            error: 'Request timeout. Please check your connection and try again.',
          };
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error('❌ API request failed:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Network request failed';
      
      if (error.message === 'Network request failed' || error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    headers?: HeadersInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
