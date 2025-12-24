import apiClient, { ApiResponse } from './client';

export interface PushTokenRequest {
  fcm_token: string;
  device_type: 'ios' | 'android';
  device_name?: string;
  app_version?: string;
}

export interface PushTokenResponse {
  id: string;
  user_id: string;
  fcm_token: string;
  device_type: string;
  device_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  delivery_unlock_enabled: boolean;
  low_battery_enabled: boolean;
  failed_unlock_enabled: boolean;
  link_used_enabled: boolean;
  device_status_enabled: boolean;
  link_expiry_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // "HH:MM" format
  quiet_hours_end?: string; // "HH:MM" format
  low_battery_threshold: number; // 10-50
}

export interface NotificationPreferencesResponse extends NotificationPreferences {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistory {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: string;
  error_message?: string;
  sent_at: string;
  delivered_at?: string;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
}

/**
 * Notification API functions
 */
export class NotificationAPI {
  /**
   * Register FCM token with backend
   */
  static async registerToken(data: PushTokenRequest): Promise<ApiResponse<PushTokenResponse>> {
    return apiClient.post<PushTokenResponse>('/notifications/register-token', data);
  }

  /**
   * Unregister FCM token from backend
   */
  static async unregisterToken(fcmToken: string): Promise<ApiResponse<{message: string}>> {
    return apiClient.delete<{message: string}>(`/notifications/unregister-token/${fcmToken}`);
  }

  /**
   * Get user's notification preferences
   */
  static async getPreferences(): Promise<ApiResponse<NotificationPreferencesResponse>> {
    return apiClient.get<NotificationPreferencesResponse>('/notifications/preferences');
  }

  /**
   * Update user's notification preferences
   */
  static async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferencesResponse>> {
    return apiClient.put<NotificationPreferencesResponse>('/notifications/preferences', preferences);
  }

  /**
   * Get notification history
   */
  static async getHistory(
    skip: number = 0,
    limit: number = 20
  ): Promise<ApiResponse<{notifications: NotificationHistory[], total: number}>> {
    return apiClient.get<{notifications: NotificationHistory[], total: number}>(
      `/notifications/history?skip=${skip}&limit=${limit}`
    );
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<ApiResponse<{unread_count: number}>> {
    return apiClient.get<{unread_count: number}>('/notifications/unread-count');
  }

  /**
   * Mark notifications as read
   * If notificationIds is empty, marks all as read
   */
  static async markAsRead(notificationIds?: string[]): Promise<ApiResponse<{message: string}>> {
    return apiClient.post<{message: string}>('/notifications/mark-read', {
      notification_ids: notificationIds || null
    });
  }

  /**
   * Delete notifications (soft delete)
   * If notificationIds is empty, deletes all
   */
  static async deleteNotifications(notificationIds?: string[]): Promise<ApiResponse<{message: string}>> {
    return apiClient.delete<{message: string}>('/notifications/delete', {
      data: { notification_ids: notificationIds || null }
    });
  }

  /**
   * Send test notification
   */
  static async sendTestNotification(): Promise<ApiResponse<{message: string}>> {
    return apiClient.post<{message: string}>('/notifications/test');
  }
}

