/**
 * API Module - Central export point for all API functions
 * 
 * Usage examples:
 * 
 * import { AuthAPI, DeviceAPI, LinkAPI } from '@/api';
 * 
 * // Use API classes for all operations:
 * await AuthAPI.login(email, password);
 * await DeviceAPI.getDevices();
 * await LinkAPI.createLink(data);
 * 
 */

// Export API classes (use these for all API calls)
export { AuthAPI } from './auth';
export { DeviceAPI } from './devices';
export { LinkAPI } from './links';

// Re-export types
export type { LoginCredentials, RegisterData, UserData, LoginResponse } from './auth';

// Export client and types
export { apiClient, type ApiError, type ApiResponse } from './client';
export * from './types';

// Configuration
export const API_CONFIG = {
  // Backend server URL
  BASE_URL: '',
  
  // Production URLs (these should be set via environment variables)
  PRODUCTION_URL: process.env.EXPO_PUBLIC_API_URL || '',
  
  // Request timeouts
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration  
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Initialize API client with configuration
 */
export const initializeAPI = (config?: {
  baseURL?: string;
  timeout?: number;
}) => {
  const { apiClient } = require('./client');
  
  if (config?.baseURL) {
    apiClient.setBaseURL(config.baseURL);
  }
  
  // Set production URL in production environment
  if (process.env.NODE_ENV === 'production' && !config?.baseURL) {
    apiClient.setBaseURL(API_CONFIG.PRODUCTION_URL);
  }
};
