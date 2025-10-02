import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AuthAPI,
  getDevices,
  lockDevice,
  unlockDevice
} from '../api';
import { mockActivities, mockDeliveries, mockDevices, mockUser } from './mockData';
import { AppState, Device } from './types';

interface AppStore extends AppState {
  // Authentication
  isAuthenticated: boolean;
  authToken: string | null;
  
  // Device actions
  setCurrentDevice: (device: Device) => void;
  toggleDeviceStatus: (deviceId: string) => Promise<boolean>;
  addDevice: (device: Omit<Device, 'id'>) => void;
  removeDevice: (deviceId: string) => void;
  updateDeviceName: (deviceId: string, name: string) => void;
  
  // API actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  unlockDeviceWithLink: (linkCode: string, password: string) => Promise<boolean>;
  
  // General actions
  setLoading: (loading: boolean) => void;
  refreshData: () => Promise<void>;
  
  // Initialize store with API data
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: mockUser,
      devices: mockDevices,
      currentDevice: mockDevices[0],
      deliveries: mockDeliveries,
      activities: mockActivities,
      isLoading: false,
      
      // Authentication state
      isAuthenticated: false,
      authToken: null,

      // Authentication actions
      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true });
        
        try {
          const response = await AuthAPI.login(email, password);
          
          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              authToken: response.data.access_token,
              user: {
                id: response.data.user.id.toString(), // Convert number to string
                name: response.data.user.name,
                email: response.data.user.email,
              },
              isLoading: false,
            });
            
            // Refresh devices after login
            await get().refreshDevices();
            return true;
          } else {
            set({ isLoading: false });
            console.error('Login failed:', response.error);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async (): Promise<void> => {
        await AuthAPI.logout();
        set({
          isAuthenticated: false,
          authToken: null,
          user: mockUser, // Reset to mock user
          devices: mockDevices, // Reset to mock devices
          currentDevice: mockDevices[0],
          deliveries: mockDeliveries,
          activities: mockActivities,
        });
      },

      // Device actions with API integration
      setCurrentDevice: (device: Device) => {
        set({ currentDevice: device });
      },

      toggleDeviceStatus: async (deviceId: string): Promise<boolean> => {
        const { currentDevice, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          console.warn('User not authenticated for device toggle');
          return false;
        }

        if (!currentDevice || currentDevice.id !== deviceId) {
          console.warn('Device not found or not current device');
          return false;
        }

        set({ isLoading: true });

        try {
          const isCurrentlyLocked = currentDevice.status === 'locked';
          let response;

          if (isCurrentlyLocked) {
            // For unlocking, we would need a link code and password
            // This is a simplified version - in reality, you'd need proper unlock mechanism
            console.warn('Unlock requires link code and password - using mock toggle');
            response = { success: true };
          } else {
            // Lock the device
            response = await lockDevice(deviceId);
          }

          if (response.success) {
            // Update local state
            const devices = get().devices.map(device => 
              device.id === deviceId 
                ? { 
                    ...device, 
                    status: (device.status === 'locked' ? 'unlocked' : 'locked') as 'locked' | 'unlocked',
                    lastActivity: new Date()
                  }
                : device
            );
            
            const updatedCurrentDevice = devices.find(d => d.id === deviceId) || currentDevice;
            
            set({ 
              devices, 
              currentDevice: updatedCurrentDevice,
              isLoading: false 
            });
            
            return true;
          } else {
            set({ isLoading: false });
            console.error('Device toggle failed:', response.error);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Device toggle error:', error);
          return false;
        }
      },

      unlockDeviceWithLink: async (linkCode: string, password: string): Promise<boolean> => {
        set({ isLoading: true });

        try {
          const response = await unlockDevice(linkCode, password);
          
          if (response.success && response.data) {
            // Update device status in local state if we have device info
            if (response.data.device) {
              const devices = get().devices.map(device => 
                device.id === response.data!.device!.id
                  ? { 
                      ...device, 
                      ...response.data!.device!,
                      lastActivity: new Date()
                    }
                  : device
              );
              
              const currentDevice = get().currentDevice;
              const updatedCurrentDevice = currentDevice?.id === response.data.device.id 
                ? devices.find(d => d.id === response.data!.device!.id) || currentDevice
                : currentDevice;
              
              set({ 
                devices, 
                currentDevice: updatedCurrentDevice,
                isLoading: false 
              });
            } else {
              set({ isLoading: false });
            }
            
            return true;
          } else {
            set({ isLoading: false });
            console.error('Device unlock failed:', response.error);
            return false;
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Device unlock error:', error);
          return false;
        }
      },

      refreshDevices: async (): Promise<void> => {
        const { isAuthenticated } = get();
        
        if (!isAuthenticated) {
          console.log('Not authenticated, using mock devices');
          return;
        }

        set({ isLoading: true });

        try {
          const response = await getDevices();
          
          if (response.success && response.data) {
            const apiDevices = response.data.map(device => ({
              ...device,
              lastActivity: device.last_activity ? new Date(device.last_activity) : new Date(),
              battery: device.battery || 85, // Default battery if not provided
            }));

            const currentDevice = get().currentDevice;
            const updatedCurrentDevice = currentDevice 
              ? apiDevices.find(d => d.id === currentDevice.id) || apiDevices[0] || null
              : apiDevices[0] || null;

            set({
              devices: apiDevices,
              currentDevice: updatedCurrentDevice,
              isLoading: false,
            });
          } else {
            // If API returns error (like "Client not found"), fall back to mock data but stay authenticated
            console.warn('Failed to refresh devices:', response.error);
            console.log('Using mock devices while authenticated');
            set({ 
              devices: mockDevices, 
              currentDevice: mockDevices[0],
              isLoading: false 
            });
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Error refreshing devices:', error);
          // Fall back to mock data on network error
          set({ 
            devices: mockDevices, 
            currentDevice: mockDevices[0]
          });
        }
      },

      addDevice: (deviceData: Omit<Device, 'id'>) => {
        const newDevice: Device = {
          ...deviceData,
          id: `device_${Date.now()}`,
        };
        
        set(state => ({
          devices: [...state.devices, newDevice]
        }));
      },

      removeDevice: (deviceId: string) => {
        const devices = get().devices.filter(device => device.id !== deviceId);
        const currentDevice = get().currentDevice;
        
        set({
          devices,
          currentDevice: currentDevice?.id === deviceId 
            ? devices.length > 0 ? devices[0] : null
            : currentDevice
        });
      },

      updateDeviceName: (deviceId: string, name: string) => {
        const devices = get().devices.map(device =>
          device.id === deviceId ? { ...device, name } : device
        );
        
        const currentDevice = get().currentDevice;
        const updatedCurrentDevice = currentDevice?.id === deviceId 
          ? { ...currentDevice, name }
          : currentDevice;
        
        set({ devices, currentDevice: updatedCurrentDevice });
      },

      // General actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      refreshData: async () => {
        const { isAuthenticated } = get();
        
        set({ isLoading: true });
        
        try {
          if (isAuthenticated) {
            // Refresh real data from API
            await get().refreshDevices();
            // TODO: Add refreshing deliveries and activities when those APIs are available
          } else {
            // Simulate refresh with mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // Initialize store - check authentication and load data
      initialize: async () => {
        set({ isLoading: true });

        try {
          const isAuth = await AuthAPI.isAuthenticated();
          
          if (isAuth) {
            // Validate session
            const isValid = await AuthAPI.validateSession();
            
            if (isValid) {
              const token = await AuthAPI.getToken();
              set({ 
                isAuthenticated: true, 
                authToken: token 
              });
              
              // Load real data
              await get().refreshDevices();
            } else {
              // Session invalid, logout
              await get().logout();
            }
          }
        } catch (error) {
          console.error('Store initialization error:', error);
          // Fall back to mock data
          set({
            isAuthenticated: false,
            authToken: null,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'loqey-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        currentDevice: state.currentDevice,
      }),
    }
  )
);