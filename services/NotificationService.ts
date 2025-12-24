import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { NotificationAPI } from '../api/notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,      // Don't show banner in foreground
    shouldPlaySound: true,        // Play sound in foreground
    shouldSetBadge: true,         // Update badge count
    shouldShowBanner: false,      // Don't show banner in foreground
    shouldShowList: true,         // Show in notification center
  }),
});

class NotificationService {
  private initialized = false;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize Expo Notifications and request permissions
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const hasPermission = await this.requestPermission();

      if (hasPermission) {
        // Set up message handlers first
        this.setupMessageHandlers();

        // Get and register token in background (non-blocking)
        this.getToken().then(token => {
          if (token) {
            this.registerToken(token).catch(err =>
              console.warn('⚠️ Token registration failed:', err.message || err)
            );
          }
        }).catch(err => console.warn('⚠️ Failed to get token:', err.message || err));

        this.initialized = true;
        console.log('✅ Notification service initialized');
      } else {
        console.log('⚠️ Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Get Expo Push Token
   */
  async getToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error('Project ID not found in app config');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Failed to get Expo push token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerToken(pushToken: string): Promise<void> {
    try {
      const deviceInfo = {
        deviceName: Device.deviceName || 'Unknown',
        modelName: Device.modelName || 'Unknown',
        osName: Device.osName || Platform.OS,
        osVersion: Device.osVersion || String(Platform.Version),
      };

      const response = await NotificationAPI.registerToken({
        push_token: pushToken,
        platform: Platform.OS as 'ios' | 'android',
        device_info: deviceInfo,
      });

      if (response.success) {
        console.log('✅ Expo Push Token registered with backend');
      } else {
        console.error('Failed to register token:', response.error);
      }
    } catch (error) {
      console.error('Failed to register token:', error);
    }
  }

  /**
   * Unregister token from backend
   */
  async unregisterToken(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token) {
        const response = await NotificationAPI.unregisterToken(token);
        if (response.success) {
          console.log('✅ Token unregistered from backend');
        }
      }
    } catch (error) {
      console.error('Failed to unregister token:', error);
    }
  }

  /**
   * Setup message handlers for foreground and background
   */
  setupMessageHandlers(): void {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
      this.handleNotification(notification);
    });

    // Handle when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationPress(response.notification);
    });

    console.log('✅ Notification handlers set up');
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Handle notification when app is in foreground
   */
  handleNotification(notification: Notifications.Notification): void {
    console.log('📬 Handling foreground notification:', notification.request.content.title);

    // The notification will be displayed automatically by the handler
    // Just log it here for debugging
    // Note: The setNotificationHandler above controls how foreground notifications are displayed
  }

  /**
   * Handle notification press (navigate based on type)
   */
  handleNotificationPress(notification: Notifications.Notification): void {
    const data = notification.request.content.data;

    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'delivery_unlock':
      case 'tracking_unlock':
      case 'access_code_unlock':
        // Navigate to delivery history or specific delivery
        if (data.delivery_id) {
          console.log('Navigate to delivery:', data.delivery_id);
          // TODO: Implement navigation
        }
        break;

      case 'low_battery':
        // Navigate to device details or devices screen
        if (data.device_id) {
          console.log('Navigate to device:', data.device_id);
          // TODO: Implement navigation
        }
        break;

      case 'failed_unlock':
        // Navigate to access link or security screen
        if (data.link_id) {
          console.log('Navigate to link:', data.link_id);
          // TODO: Implement navigation
        }
        break;

      case 'link_used':
        // Navigate to access links screen
        console.log('Navigate to links screen');
        // TODO: Implement navigation
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Schedule a local notification (for testing)
   */
  async scheduleLocalNotification(title: string, body: string, data: any = {}): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: 1, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
  }
}

export default new NotificationService();
