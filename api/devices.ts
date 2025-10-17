import apiClient, { ApiResponse } from './client';

export type DeviceType = 'smart_box' | 'smart_lock' | 'smart_container';

export interface Device {
  id: string;
  serial_number: string;
  device_type: DeviceType;
  model: string;
  name?: string;
  status: 'available' | 'assigned' | 'active' | 'maintenance' | 'decommissioned';
  lock_status: 'locked' | 'unlocked' | 'unknown';
  battery_level?: number;
  is_online: boolean;
  last_heartbeat?: string;
  last_activity?: string;
  firmware_version?: string;
  created_at: string;
  updated_at: string;
  user_device_name?: string;
  assigned_at?: string;
  location_address?: string;
  location_latitude?: number;
  location_longitude?: number;
  active_links_count?: number;
  total_deliveries?: number;
}

export interface DeviceAssignRequest {
  serial_number: string;
  pin: string;
  device_name?: string;
}

export interface DeviceAssignResponse {
  device_id: string;
  serial_number: string;
  device_name: string;
  message: string;
  success: boolean;
}

export interface DeviceCommandResponse {
  success: boolean;
  message: string;
  command: string;
  device_id: string;
  timestamp: string;
}

/**
 * Device API functions
 */
export class DeviceAPI {
  /**
   * Get all devices assigned to the current user
   */
  static async getDevices(): Promise<ApiResponse<Device[]>> {
    return apiClient.get<Device[]>('/devices/');
  }  /**
   * Assign a device to user using serial number + PIN
   */
  static async assignDevice(request: DeviceAssignRequest): Promise<ApiResponse<DeviceAssignResponse>> {
    return apiClient.post<DeviceAssignResponse>('/devices/assign', request);
  }

  /**
   * Get device by ID
   */
  static async getDevice(deviceId: string): Promise<ApiResponse<Device>> {
    return apiClient.get<Device>(`/devices/${deviceId}`);
  }

  /**
   * Unlock a device
   */
  static async unlockDevice(deviceId: string): Promise<ApiResponse<DeviceCommandResponse>> {
    return apiClient.post<DeviceCommandResponse>(`/devices/${deviceId}/unlock`);
  }

  /**
   * Update device settings
   */
  static async updateDevice(
    deviceId: string,
    data: {
      name?: string;
      location_address?: string;
      location_latitude?: number;
      location_longitude?: number;
    }
  ): Promise<ApiResponse<Device>> {
    return apiClient.put<Device>(`/devices/${deviceId}`, data);
  }

  /**
   * Unlink device from user
   */
  static async unlinkDevice(deviceId: string): Promise<ApiResponse<{ message: string; success: boolean }>> {
    return apiClient.delete(`/devices/${deviceId}/unlink`);
  }
}

// Export convenience functions
export const getDevices = DeviceAPI.getDevices;
export const assignDevice = DeviceAPI.assignDevice;
export const getDevice = DeviceAPI.getDevice;
export const unlockDevice = DeviceAPI.unlockDevice;
export const updateDevice = DeviceAPI.updateDevice;
export const unlinkDevice = DeviceAPI.unlinkDevice;
