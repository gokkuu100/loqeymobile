import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../api/auth';
import { DeviceAPI, Device, DeviceAssignRequest, DeviceAssignResponse } from '../api/devices';
import { LinkAPI, AccessLink, CreateAccessLinkRequest, AccessLinkResponse } from '../api/links';

// User interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  resident_state: string;
  zip_code: string;
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
  createLink: (data: CreateAccessLinkRequest) => Promise<AccessLinkResponse | null>;
  deleteLink: (linkId: string) => Promise<boolean>;
  revokeLink: (linkId: string) => Promise<boolean>;
  
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
      isLoading: false,
      notifications: [],
      
      // Auth Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await AuthAPI.login(email, password);
          
          if (response.success && response.data) {
            set({
              authToken: response.data.access_token,
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            get().addNotification('success', 'Login successful!');
            
            // Load initial data
            await Promise.all([
              get().loadDevices(),
              get().loadLinks(),
            ]);
            
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Login failed');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          get().addNotification('error', 'Network error. Please try again.');
          return false;
        }
      },
      
      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await AuthAPI.register(data);
          
          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Registration successful! Please login.');
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Registration failed');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
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
          const response = await DeviceAPI.getDevices();
          
          if (response.success && response.data) {
            set({ 
              devices: response.data,
              devicesLoading: false,
            });
            
            // Set first device as selected if none selected
            if (!get().selectedDevice && response.data.length > 0) {
              set({ selectedDevice: response.data[0] });
            }
          } else {
            set({ devicesLoading: false });
            get().addNotification('error', response.error || 'Failed to load devices');
          }
        } catch (error) {
          set({ devicesLoading: false });
          console.error('Load devices error:', error);
        }
      },
      
      assignDevice: async (request: DeviceAssignRequest) => {
        set({ isLoading: true });
        try {
          const response = await DeviceAPI.assignDevice(request);
          
          if (response.success && response.data) {
            set({ isLoading: false });
            get().addNotification('success', 'Device assigned successfully!');
            
            // Reload devices
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to assign device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
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
          const response = await DeviceAPI.updateDevice(deviceId, data);
          
          if (response.success) {
            set({ isLoading: false });
            get().addNotification('success', 'Device updated successfully!');
            await get().loadDevices();
            return true;
          } else {
            set({ isLoading: false });
            get().addNotification('error', response.error || 'Failed to update device');
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
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
    }
  )
);
