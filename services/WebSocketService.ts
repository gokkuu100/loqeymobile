/**
 * Singleton WebSocket Service
 * Maintains a single persistent connection independent of React re-renders
 */
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { websocketClient, WebSocketMessage } from '../api/websocket';
import { useAppStore } from '../store';
import { AuthAPI } from '../api/auth';

class WebSocketService {
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10; // Increased for better resilience
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private appStateSubscription: any = null;
  private currentToken: string | null = null;
  private shouldStayConnected: boolean = false;
  private isRefreshingToken: boolean = false;
  private lastAppResumeTime: number = 0;
  private readonly RESUME_THROTTLE_MS = 2000; // Wait 2s after app resume
  private readonly BASE_RECONNECT_DELAY = 1000; // Start at 1 second
  private readonly MAX_RECONNECT_DELAY = 30000; // Cap at 30 seconds

  constructor() {
    // Listen to app state changes
    this.setupAppStateListener();
  }

  /**
   * Setup app state listener for background/foreground handling
   */
  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle app state changes (background/foreground)
   * Implements throttling to prevent immediate reconnect on resume
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && this.shouldStayConnected && !this.isConnected) {
      const now = Date.now();
      const timeSinceLastResume = now - this.lastAppResumeTime;
      
      // Throttle reconnection - wait for network to stabilize
      if (timeSinceLastResume < this.RESUME_THROTTLE_MS) {
        console.log('[WebSocketService] App resumed too quickly, throttling reconnect');
        return;
      }
      
      this.lastAppResumeTime = now;
      
      console.log('[WebSocketService] App resumed - reconnecting in 2s...');
      setTimeout(() => {
        if (AppState.currentState === 'active' && this.shouldStayConnected && !this.isConnected) {
          this.connect();
        }
      }, this.RESUME_THROTTLE_MS);
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      console.log('[WebSocketService] App backgrounded - keeping connection alive');
      // Don't disconnect on background - keep receiving updates
    }
  };

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage = (message: WebSocketMessage) => {
    console.log('[WebSocketService] Message:', message.type);

    if (message.type === 'connection') {
      console.log('✅ [WebSocketService] Connected to server');
      return;
    }

    // Handle device updates - can come as direct device_update or nested in user_update
    if (message.type === 'device_update' || 
        (message.type === 'user_update' && message.data?.type === 'device_update')) {
      
      if (!message.data) return;

      const deviceUpdate = message.data;
      
      // Ensure we have a device_id
      if (!deviceUpdate.device_id) {
        console.warn('[WebSocketService] Device update missing device_id');
        return;
      }
      
      // Update devices in store efficiently
      const currentDevices = useAppStore.getState().devices;
      
      // Check if device exists and if values have actually changed
      const targetDevice = currentDevices.find(d => d.id === deviceUpdate.device_id);
      if (!targetDevice) {
        console.warn('[WebSocketService] Device not found in store:', deviceUpdate.device_id);
        return; // Device not found in store
      }
      
      // Only update if values have actually changed
      const hasChanges = 
        targetDevice.battery_level !== deviceUpdate.battery_level ||
        targetDevice.lock_status !== deviceUpdate.lock_status ||
        targetDevice.is_online !== deviceUpdate.is_online ||
        targetDevice.last_heartbeat !== deviceUpdate.last_heartbeat;
      
      if (!hasChanges) {
        // No actual changes, skip the update to prevent re-renders
        return;
      }
      
      console.log('[WebSocketService] Updating device:', deviceUpdate.device_id);
      
      const updatedDevices = currentDevices.map(device => {
        if (device.id === deviceUpdate.device_id) {
          return {
            ...device,
            battery_level: deviceUpdate.battery_level ?? device.battery_level,
            lock_status: deviceUpdate.lock_status ?? device.lock_status,
            is_online: deviceUpdate.is_online ?? device.is_online,
            last_heartbeat: deviceUpdate.last_heartbeat ?? device.last_heartbeat,
            updated_at: new Date().toISOString(),
          };
        }
        return device;
      });

      // Batch update: devices + selectedDevice in one setState call
      const currentSelectedDevice = useAppStore.getState().selectedDevice;
      const updatedSelectedDevice = currentSelectedDevice?.id === deviceUpdate.device_id
        ? updatedDevices.find(d => d.id === deviceUpdate.device_id)
        : currentSelectedDevice;

      useAppStore.setState({
        devices: updatedDevices,
        selectedDevice: updatedSelectedDevice || currentSelectedDevice,
      });
      return;
    }

    // Handle new notification - increment unread count
    if (message.type === 'notification' || 
        (message.type === 'user_update' && message.data?.type === 'notification')) {
      console.log('[WebSocketService] New notification received');
      
      // Increment unread notification count
      useAppStore.getState().incrementUnreadNotificationCount();
      
      // Optionally show a toast/banner notification
      if (message.data?.title && message.data?.body) {
        useAppStore.getState().addNotification('info', `${message.data.title}: ${message.data.body}`);
      }
      return;
    }

    // Handle link_used updates for real-time link status
    if (message.type === 'user_update' && message.data?.type === 'link_used') {
      const linkUpdate = message.data;
      console.log('[WebSocketService] Link used:', linkUpdate.link_id);
      
      // Update the link in the store
      useAppStore.getState().updateLinkUsage(linkUpdate.link_id, {
        current_uses: linkUpdate.current_uses,
        status: linkUpdate.status,
        used_at: linkUpdate.used_at,
      });
      
      // Show notification to user
      useAppStore.getState().addNotification(
        linkUpdate.success ? 'success' : 'warning',
        `Access link used ${linkUpdate.success ? 'successfully' : 'unsuccessfully'}`
      );
    }
  };

  /**
   * Validate and refresh token if needed
   * Implements silent token refresh to maintain seamless connection
   */
  private async getValidToken(): Promise<string | null> {
    // Get token from Zustand store (single source of truth)
    const { useAppStore } = require('../store');
    const token = useAppStore.getState().authToken;
    if (!token) return null;

    // Check if token is expired or expiring soon
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // If token is expired OR expires in less than 5 minutes, refresh it
      if (timeUntilExpiry < 300000) {
        const isExpired = timeUntilExpiry < 0;
        
        if (isExpired) {
          console.log('[WebSocketService] ⚠️ Token EXPIRED', Math.abs(Math.floor(timeUntilExpiry / 1000)), 'seconds ago - refreshing...');
        } else {
          console.log('[WebSocketService] Token expiring in', Math.floor(timeUntilExpiry / 1000), 'seconds - refreshing...');
        }
        
        // Prevent concurrent refresh attempts
        if (this.isRefreshingToken) {
          console.log('[WebSocketService] Token refresh already in progress, waiting...');
          // Wait for ongoing refresh (max 5 seconds)
          for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!this.isRefreshingToken) {
              // Refresh completed, get the new token from Zustand
              const newToken = useAppStore.getState().authToken;
              console.log('[WebSocketService] Got refreshed token');
              return newToken;
            }
          }
          console.warn('[WebSocketService] Refresh timeout, proceeding anyway');
          return null;
        }
        
        this.isRefreshingToken = true;
        
        try {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (!refreshToken) {
            console.warn('[WebSocketService] No refresh token available - user needs to re-login');
            return null;
          }
          
          console.log('[WebSocketService] Attempting silent token refresh...');
          const response = await AuthAPI.refreshToken(refreshToken);
          
          if (response.success && response.data) {
            console.log('✅ [WebSocketService] Token refreshed successfully');
            
            // Update Zustand store with new token (single source of truth)
            const { useAppStore } = require('../store');
            useAppStore.setState({
              authToken: response.data.access_token,
              isAuthenticated: true,
            });
            
            // Store new refresh token if provided
            if (response.data.refresh_token) {
              await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
              console.log('✅ [WebSocketService] Refresh token updated');
            }
            
            // Update the token in our tracking
            this.currentToken = response.data.access_token;
            
            return response.data.access_token;
          }
          
          console.error('[WebSocketService] Token refresh failed:', response.error);
          return null;
        } catch (error) {
          console.error('[WebSocketService] Error refreshing token:', error);
          return null;
        } finally {
          this.isRefreshingToken = false;
        }
      }
      
      // Token is still valid (more than 5 minutes remaining)
      return token;
    } catch (error) {
      console.error('[WebSocketService] Error parsing token:', error);
      return null;
    }
  }

  /**
   * Calculate exponential backoff delay
   * Implements progressive delays to avoid "storm reconnects"
   */
  private getReconnectDelay(): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const delay = Math.min(
      this.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      this.MAX_RECONNECT_DELAY
    );
    
    // Add jitter (±20%) to prevent thundering herd
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.floor(delay + jitter);
  }

  /**
   * Connect to WebSocket server
   * Implements token validation and exponential backoff reconnection
   */
  async connect(): Promise<void> {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnected) {
      console.log('[WebSocketService] Already connected');
      return;
    }
    
    if (this.isConnecting) {
      console.log('[WebSocketService] Connection already in progress');
      return;
    }

    this.shouldStayConnected = true;
    this.isConnecting = true;

    try {
      // Get and validate token (with automatic refresh if needed)
      const token = await this.getValidToken();
      if (!token) {
        throw new Error('No valid auth token found');
      }

      // Don't reconnect if token changed (user logged out/in)
      if (this.currentToken && this.currentToken !== token) {
        console.log('[WebSocketService] Token changed, cleaning up old connection');
        this.forceDisconnect();
      }
      
      this.currentToken = token;

      console.log('[WebSocketService] Connecting to server...');
      
      // Register message handler ONCE
      websocketClient.on('*', this.handleMessage);
      
      // Connect
      await websocketClient.connectToUserDevices();
      
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0; // Reset on successful connection
      
      console.log('✅ [WebSocketService] Connection established');
    } catch (error: any) {
      console.error('[WebSocketService] Connection error:', error);
      this.isConnecting = false;
      this.isConnected = false;
      
      // Handle authentication errors (403, 401)
      if (error?.message?.includes('403') || error?.message?.includes('401')) {
        console.error('[WebSocketService] Auth error detected');
        
        // Try to refresh token ONE time before giving up
        if (this.reconnectAttempts === 0) {
          console.log('[WebSocketService] Attempting token refresh due to auth error...');
          this.currentToken = null; // Clear cached token to force refresh
          
          // Try to get a new token
          const newToken = await this.getValidToken();
          if (newToken) {
            console.log('[WebSocketService] Got new token, retrying connection...');
            this.reconnectAttempts = 1;
            
            // Retry connection immediately with new token
            setTimeout(() => {
              this.connect();
            }, 1000);
            return;
          }
        }
        
        console.error('[WebSocketService] Auth error - token refresh failed, stopping reconnect');
        this.shouldStayConnected = false;
        return;
      }
      
      // Auto-reconnect with exponential backoff
      if (this.shouldStayConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.getReconnectDelay();
        
        console.log(
          `[WebSocketService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, delay);
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocketService] Max reconnection attempts reached');
        this.shouldStayConnected = false;
      }
    }
  }

  /**
   * Graceful disconnect (user initiated)
   */
  disconnect(): void {
    console.log('[WebSocketService] Graceful disconnect requested');
    this.shouldStayConnected = false;
    this.forceDisconnect();
  }

  /**
   * Force disconnect (internal use)
   */
  private forceDisconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    websocketClient.off('*');
    websocketClient.disconnect();
    
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.currentToken = null;
    
    console.log('[WebSocketService] Disconnected');
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup on app exit
   */
  cleanup(): void {
    this.disconnect();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
