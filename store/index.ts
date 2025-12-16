import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../api/auth';
import { DeviceAPI, Device, DeviceAssignRequest, DeviceAssignResponse } from '../api/devices';
import { LinkAPI, AccessLink, CreateAccessLinkRequest, AccessLinkResponse, LinksStatsResponse } from '../api/links';
import apiClient from '../api/client';

/**
 * Check if JWT token is expired or expiring soon
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    return now >= expiresAt - 60000; // Expired or expires within 1 minute
  } catch (error) {
    return true; // If can't parse, consider expired
  }
}

// User interface (matches backend UserResponse)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  resident_state: string;
  zip_code: string;
  email_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean;
}

// Notification interface
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

// Main store interface
interface AppStore {
  // Auth State
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;

  // Device State
  devices: Device[];
  selectedDevice: Device | null;
  devicesLoading: boolean;

  // Links State
  accessLinks: AccessLink[];
  linksLoading: boolean;
  linksStats: LinksStatsResponse | null;

  // UI State
  isLoading: boolean;
  notifications: Notification[];

  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    resident_state: string;
    zip_code: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;

  // Profile Actions
  updateUserProfile: (userData: User) => void;

  // Device Actions
  loadDevices: () => Promise<void>;
  assignDevice: (request: DeviceAssignRequest) => Promise<boolean>;
  unlockDevice: (deviceId: string) => Promise<boolean>;
  updateDevice: (deviceId: string, data: {
    name?: string;
    location_address?: string;
    location_latitude?: number;
    location_longitude?: number;
  }) => Promise<boolean>;
  unlinkDevice: (deviceId: string) => Promise<boolean>;
  setSelectedDevice: (device: Device | null) => void;

  // Links Actions
  loadLinks: (deviceId?: string) => Promise<void>;
  loadLinksStats: () => Promise<void>;
  createLink: (data: CreateAccessLinkRequest) => Promise<AccessLinkResponse | null>;
  deleteLink: (linkId: string) => Promise<boolean>;
  revokeLink: (linkId: string) => Promise<boolean>;
  updateLinkUsage: (linkId: string, updates: Partial<AccessLink>) => void;

  // UI Actions
  addNotification: (type: Notification['type'], message: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      authToken: null,
      isAuthenticated: false,
      devices: [],
      selectedDevice: null,
      devicesLoading: false,
      accessLinks: [],
      linksLoading: false,
      linksStats: null,
      isLoading: false,
      notifications: [],

      // Auth Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔐 Attempting login for:', email);
          const response = await AuthAPI.login(email, password);

          console.log('📡 Login response:', {
            success: response.success,
            hasData: !!response.data,
            error: response.error
          });

          if (response.success && response.data) {
            console.log('✅ Login successful, setting user data');
            console.log('🔑 Access token received:', response.data.access_token.substring(0, 20) + '...');

            // Store refresh token in AsyncStorage
            if (response.data.refresh_token) {
              await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
              console.log('🔄 Refresh token stored');
            }

            set({
              authToken: response.data.access_token,
              user: response.data.user,
              isAuthenticated: true,
            });

            // Verify token is stored in both places
            const storedToken = await (apiClient as any).getAuthToken();
            console.log('✅ Token stored in AsyncStorage:', storedToken ? 'YES' : 'NO');
            console.log('✅ Token in Zustand state:', get().authToken ? 'YES' : 'NO');

            get().addNotification('success', 'Welcome back!');

            // Load initial data in background (don't wait)
            console.log('🔄 Loading initial data...');
            Promise.all([
              get().loadDevices().catch(err => {
                console.warn('Device load failed:', err);
                // Don't fail login if device load fails
              }),
              get().loadLinks().catch(err => {
                console.warn('Links load failed:', err);
                // Don't fail login if links load fails
              }),
            ]).finally(() => {
              set({ isLoading: false });
              console.log('✅ Login complete!');
            });

            return true;
          } else {
            console.error('❌ Login failed:', response.error);
            set({ isLoading: false });

            // Provide specific error messages
            const errorMsg = response.error || 'Invalid email or password';
            get().addNotification('error', errorMsg);
            return false;
          }
        } catch (error: any) {
          console.error('❌ Login exception:', error);
          set({ isLoading: false });

          // User-friendly error message
          const errorMsg = error.message?.includes('timeout')
            ? 'Connection timeout. Please check your internet and try again.'
            : error.message?.includes('connect')
              ? 'Cannot reach server. Please check your connection.'
              : 'Login failed. Please try again.';

          get().addNotification('error', errorMsg);
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          console.log('📝 Registering user:', { ...data, password: '***' });
          const response = await AuthAPI.register(data);
          console.log('📝 Registration response:', response);

          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Registration successful! Please login.');
            return true;
          } else {
            set({ isLoading: false });
            const errorMsg = response.error || 'Registration failed';
            console.error('❌ Registration failed:', errorMsg);
            get().addNotification('error', errorMsg);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ Registration error:', error);
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      logout: async () => {
        try {
          await AuthAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }

        // Clear refresh token
        try {
          await AsyncStorage.removeItem('refresh_token');
          console.log('🔄 Refresh token cleared');
        } catch (error) {
          console.error('Error clearing refresh token:', error);
        }

        set({
          user: null,
          authToken: null,
          isAuthenticated: false,
          devices: [],
          selectedDevice: null,
          accessLinks: [],
          notifications: [],
        });
      },

      loadUserProfile: async () => {
        try {
          const response = await AuthAPI.getProfile();

          if (response.success && response.data) {
            set({ user: response.data });
          } else {
            // Token might be invalid
            get().addNotification('warning', 'Session expired. Please login again.');
            await get().logout();
          }
        } catch (error) {
          console.error('Load profile error:', error);
        }
      },

      // Device Actions
      loadDevices: async () => {
        set({ devicesLoading: true });
        try {
          console.log('📱 Loading devices...');

          // Check if token exists before making request
          const storedToken = await (apiClient as any).getAuthToken();
          const zustandToken = get().authToken;
          console.log('🔑 Token check - AsyncStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : 'MISSING!');
          console.log('🔑 Token check - Zustand:', zustandToken ? `${zustandToken.substring(0, 20)}...` : 'MISSING!');

          const response = await DeviceAPI.getDevices();
          console.log('📱 Devices response:', response);

          if (response.success && response.data) {
            console.log(`✅ Loaded ${response.data.length} devices`);
            
            // Get current selectedDevice before updating
            const currentSelectedDevice = get().selectedDevice;
            
            set({
              devices: response.data,
              devicesLoading: false,
            });

            // Update selectedDevice to point to fresh data from new array
            if (currentSelectedDevice) {
              const updatedSelectedDevice = response.data.find(
                (d: Device) => d.id === currentSelectedDevice.id
              );
              if (updatedSelectedDevice) {
                console.log('🔄 Syncing selectedDevice with fresh data');
                set({ selectedDevice: updatedSelectedDevice });
              } else {
                // Selected device no longer exists, clear it
                console.log('⚠️ Selected device no longer exists');
                set({ selectedDevice: null });
              }
            } else if (response.data.length > 0) {
              // No device selected, set first device as selected
              console.log('📌 Setting first device as selected:', response.data[0].name);
              set({ selectedDevice: response.data[0] });
            }
          } else {
            console.log('⚠️ No devices or error:', response.error);
            set({
              devices: [],
              devicesLoading: false
            });

            // Only show notification if there's an actual error, not just empty devices
            if (response.error && response.status !== 200) {
              get().addNotification('error', response.error || 'Failed to load devices');
            }
          }
        } catch (error) {
          console.error('❌ Load devices error:', error);
          set({
            devices: [],
            devicesLoading: false
          });
          get().addNotification('error', 'Failed to connect to server');
        }
      },

      assignDevice: async (request: DeviceAssignRequest) => {
        set({ isLoading: true });
        try {
          console.log('📝 Assigning device:', request);
          const response = await DeviceAPI.assignDevice(request);
          console.log('📝 Assign response:', response);

          if (response.success && response.data) {
            set({ isLoading: false });
            get().addNotification('success', 'Device assigned successfully!');

            // Reload devices
            console.log('🔄 Reloading devices after assignment...');
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            console.error('❌ Device assignment failed:', response.error);
            get().addNotification('error', response.error || 'Failed to assign device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('❌ Device assignment error:', error);
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      unlockDevice: async (deviceId: string) => {
        set({ isLoading: true });
        try {
          const response = await DeviceAPI.unlockDevice(deviceId);

          if (response.success && response.data) {
            set({ isLoading: false });
            get().addNotification('success', 'Device unlock command sent!');

            // Reload device to get updated status
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to unlock device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      updateDevice: async (deviceId, data) => {
        set({ isLoading: true });
        try {
          console.log('[Store] updateDevice called:', { deviceId, data });
          const response = await DeviceAPI.updateDevice(deviceId, data);
          console.log('[Store] updateDevice response:', response);

          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Device updated successfully!');
            console.log('[Store] Reloading devices after update');
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to update device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('[Store] updateDevice error:', error);
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      unlinkDevice: async (deviceId) => {
        set({ isLoading: true });
        try {
          const response = await DeviceAPI.unlinkDevice(deviceId);

          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Device unlinked successfully!');
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to unlink device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      setSelectedDevice: (device) => {
        set({ selectedDevice: device });
      },

      // Links Actions
      loadLinks: async (deviceId?: string) => {
        set({ linksLoading: true });
        try {
          const response = await LinkAPI.getLinks(deviceId);

          if (response.success && response.data) {
            set({
              accessLinks: response.data,
              linksLoading: false,
            });
          } else {
            set({ linksLoading: false });
            get().addNotification('error', response.error || 'Failed to load links');
          }
        } catch (error) {
          set({ linksLoading: false });
          console.error('Load links error:', error);
        }
      },

      loadLinksStats: async () => {
        try {
          const response = await LinkAPI.getStats();

          if (response.success && response.data) {
            set({ linksStats: response.data });
          } else {
            console.error('Failed to load links stats:', response.error);
          }
        } catch (error) {
          console.error('Load links stats error:', error);
        }
      },

      createLink: async (data: CreateAccessLinkRequest) => {
        set({ isLoading: true });
        try {
          const response = await LinkAPI.createLink(data);

          if (response.success && response.data) {
            set({ isLoading: false });
            get().addNotification('success', 'Access link created successfully!');

            // Reload links
            await get().loadLinks(data.device_id);
            return response.data;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to create link');
            return null;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return null;
        }
      },

      deleteLink: async (linkId: string) => {
        set({ isLoading: true });
        try {
          const response = await LinkAPI.deleteLink(linkId);

          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Link deleted successfully!');
            await get().loadLinks();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to delete link');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      revokeLink: async (linkId: string) => {
        set({ isLoading: true });
        try {
          const response = await LinkAPI.revokeLink(linkId);

          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Link revoked successfully!');
            await get().loadLinks();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to revoke link');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },

      updateLinkUsage: (linkId: string, updates: Partial<AccessLink>) => {
        const currentLinks = get().accessLinks;
        const updatedLinks = currentLinks.map(link => {
          if (link.id === linkId) {
            return { ...link, ...updates };
          }
          return link;
        });
        set({ accessLinks: updatedLinks });
        console.log(`[Store] Updated link ${linkId} usage:`, updates);
      },

      // Profile Actions
      updateUserProfile: (userData: User) => {
        console.log('📝 Updating user profile in store');
        console.log('📝 Received userData:', JSON.stringify(userData, null, 2));
        console.log('📝 userData keys:', Object.keys(userData));
        console.log('📝 userData.email:', userData.email);
        console.log('📝 userData.first_name:', userData.first_name);

        const currentState = get();
        console.log('📝 Current state before update:', {
          hasUser: !!currentState.user,
          hasToken: !!currentState.authToken,
          isAuthenticated: currentState.isAuthenticated,
          currentUserEmail: currentState.user?.email,
        });

        set((state) => ({
          ...state,
          user: userData,
        }));

        const newState = get();
        console.log('✅ User profile updated in store');
        console.log('✅ New state after update:', {
          hasUser: !!newState.user,
          hasToken: !!newState.authToken,
          isAuthenticated: newState.isAuthenticated,
          newUserEmail: newState.user?.email,
        });
      },

      // UI Actions
      addNotification: (type, message) => {
        const notification: Notification = {
          id: Date.now().toString(),
          type,
          message,
          timestamp: new Date(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));

        // Auto-clear after 5 seconds
        setTimeout(() => {
          get().clearNotification(notification.id);
        }, 5000);
      },

      clearNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'loqey-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('🔄 Starting store rehydration...');
        return async (state, error) => {
          if (error) {
            console.error('❌ Store rehydration error:', error);
            return;
          }

          if (state?.authToken) {
            console.log('✅ Store rehydrated with auth token');
            
            // Check if token is expired
            if (isTokenExpired(state.authToken)) {
              console.log('⚠️ Token expired, attempting refresh...');
              
              // Try to refresh the token
              const refreshToken = await AsyncStorage.getItem('refresh_token');
              if (refreshToken) {
                try {
                  const response = await AuthAPI.refreshToken(refreshToken);
                  if (response.success && response.data) {
                    console.log('✅ Token refreshed successfully');
                    await apiClient.setAuthToken(response.data.access_token);
                    // Update store with new token (using set from useAppStore)
                    useAppStore.setState({
                      authToken: response.data.access_token,
                      isAuthenticated: true,
                    });
                    return;
                  }
                } catch (error) {
                  console.error('❌ Token refresh failed:', error);
                }
              }
              
              // Refresh failed - clear auth state
              console.log('❌ Token refresh failed, clearing auth state');
              await apiClient.clearAuthToken();
              useAppStore.setState({
                authToken: null,
                isAuthenticated: false,
                user: null,
              });
            } else {
              // Token is still valid
              console.log('✅ Token is valid, restoring to apiClient');
              await apiClient.setAuthToken(state.authToken);
            }
          } else {
            console.log('⚠️ Store rehydrated but no auth token found');
          }
        };
      },
    }
  )
);
