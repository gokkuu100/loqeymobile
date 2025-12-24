import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { NotificationAPI } from '../api/notifications';

// Check if Firebase is available (not available in Expo Go)
let messaging: any = null;
let FirebaseMessagingTypes: any = null;

try {
  const firebaseMessaging = require('@react-native-firebase/messaging');
  messaging = firebaseMessaging.default;
  FirebaseMessagingTypes = firebaseMessaging;
} catch (error) {
  console.warn('⚠️ Firebase Messaging not available (likely running in Expo Go). Push notifications will be disabled.');
}

class NotificationService {
  private initialized = false;
  private isFirebaseAvailable = false;

  /**
   * Check if Firebase is available
   */
  private checkFirebaseAvailability(): boolean {
    if (this.isFirebaseAvailable) return true;
    
    try {
      if (messaging && typeof messaging === 'function') {
        this.isFirebaseAvailable = true;
        return true;
      }
    } catch (error) {
      // Firebase not available
    }
    
    return false;
  }

  /**
   * Initialize Firebase Messaging and request permissions
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Check if Firebase is available (won't be in Expo Go)
    if (!this.checkFirebaseAvailability()) {
      console.warn('⚠️ Firebase not available. Push notifications disabled. Use development build for full functionality.');
      return;
    }

    try {
      const authStatus = await this.requestPermission();
      
      if (authStatus) {
        // Get FCM token and register with backend
        const token = await this.getToken();
        if (token) {
          await this.registerToken(token);
        }

        // Set up message handlers
        this.setupMessageHandlers();
        
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
    if (!this.checkFirebaseAvailability()) {
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // No permission needed for Android < 13
      } else {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (!this.checkFirebaseAvailability()) {
      return null;
    }

    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Register token with backend
   */
  async registerToken(fcmToken: string): Promise<void> {
    try {
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      const deviceName = Platform.OS === 'ios' 
        ? `iPhone` 
        : `Android ${Platform.Version}`;

      const response = await NotificationAPI.registerToken({
        fcm_token: fcmToken,
        device_type: deviceType,
        device_name: deviceName,
        app_version: '1.0.0', // TODO: Get from app config
      });

      if (response.success) {
        console.log('✅ Token registered with backend');
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
    if (!this.checkFirebaseAvailability()) {
      return;
    }

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage: any) => {
      console.log('Foreground message received:', remoteMessage);
      this.handleNotification(remoteMessage);
    });

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('Background message received:', remoteMessage);
    });

    // Handle notification opened app from background/quit state
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('Notification opened app:', remoteMessage);
      this.handleNotificationPress(remoteMessage);
    });

    // Handle notification opened app from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          this.handleNotificationPress(remoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh(async (token: string) => {
      console.log('Token refreshed:', token);
      await this.registerToken(token);
    });
  }

  /**
   * Handle notification when app is in foreground
   */
  handleNotification(remoteMessage: any): void {
    const { notification, data } = remoteMessage;

    if (notification) {
      // Show a local alert (or use a custom in-app notification UI)
      Alert.alert(
        notification.title || 'Notification',
        notification.body || '',
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View',
            onPress: () => this.handleNotificationPress(remoteMessage),
          },
        ]
      );
    }
  }

  /**
   * Handle notification press (navigate based on type)
   */
  handleNotificationPress(remoteMessage: any): void {
    const { data } = remoteMessage;

    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'delivery_unlock':
      case 'tracking_unlock':
      case 'access_code_unlock':
        // Navigate to delivery history or specific delivery
        if (data.delivery_id) {
          // TODO: Navigate to delivery details screen
          console.log('Navigate to delivery:', data.delivery_id);
        }
        break;

      case 'low_battery':
        // Navigate to device details or devices screen
        if (data.device_id) {
          // TODO: Navigate to device details screen
          console.log('Navigate to device:', data.device_id);
        }
        break;

      case 'failed_unlock':
        // Navigate to access link or security screen
        if (data.link_id) {
          // TODO: Navigate to link details screen
          console.log('Navigate to link:', data.link_id);
        }
        break;

      case 'link_used':
        // Navigate to access links screen
        // TODO: Navigate to links screen
        console.log('Navigate to links screen');
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    if (!this.checkFirebaseAvailability()) {
      return 0;
    }

    if (Platform.OS === 'ios') {
      try {
        return await messaging().getInitialNotification() ? 1 : 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Clear notification badge
   */
  async clearBadge(): Promise<void> {
    if (Platform.OS === 'ios') {
      // iOS badge clearing would be handled by the backend
      // via APNs when notifications are read
    }
  }
}

export default new NotificationService();

