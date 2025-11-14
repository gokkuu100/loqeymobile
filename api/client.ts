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
   * Get stored authentication token
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Store authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Remove authentication token and refresh token
   */
  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      console.log('✅ Auth tokens cleared');
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  /**
   * Build headers with authentication if token exists
   */
  private async buildHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = await this.getAuthToken();
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
   * Generic request method with timeout support
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.buildHeaders(options.headers);

      console.log(`🌐 API ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('📤 Request body:', JSON.parse(options.body as string));
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
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
