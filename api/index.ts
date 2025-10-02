/**
 * API Module - Central export point for all API functions
 * 
 * Usage examples:
 * 
 * import { AuthAPI, DeviceAPI, LinkAPI } from '@/api';
 * import { login, getDevices, createLink } from '@/api';
 * 
 */

// Export API classes
export { AuthAPI } from './auth';
export { DeviceAPI } from './devices';
export { LinkAPI } from './links';

// Export convenience functions
export {
  isAuthenticated, login,
  logout, test,
  validateSession
} from './auth';

export {
  deleteDevice, getDevice, getDevices, getDeviceStatus, lockDevice, triggerDeviceAction, unlockDevice, updateDevice
} from './devices';

export {
  createLink,
  createLinkWithDuration,
  deleteLink, generateShareableURL, getActiveLinks, getAllLinks,
  getDeviceLinks, getLink,
  getLinkByCode, isLinkValid, updateLink
} from './links';

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
