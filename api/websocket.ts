/**
 * WebSocket API for Real-time Device Updates
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WebSocketMessage {
  type: string;
  device_id?: string;
  user_id?: number;
  data?: any;
  timestamp: string;
}

export interface DeviceUpdate {
  type: string;
  payload: any;
  topic: string;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private isIntentionallyClosed: boolean = false;
  private token: string | null = null;

  constructor(baseUrl: string = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000') {
    // Convert HTTP URL to WS URL
    // Remove /api/v1 suffix if present since WebSocket endpoints are at root
    const cleanUrl = baseUrl.replace(/\/api\/v1$/, '');
    this.url = cleanUrl.replace(/^http/, 'ws');
  }

  /**
   * Initialize WebSocket connection
   */
  async connect(endpoint: string): Promise<void> {
    try {
      // Get authentication token (using same key as API client)
      this.token = await AsyncStorage.getItem('auth_token');
      if (!this.token) {
        throw new Error('No authentication token found');
      }

      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      this.isIntentionallyClosed = false;

      // Create WebSocket URL with token
      const wsUrl = `${this.url}${endpoint}?token=${this.token}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[WebSocket] Connected to ${endpoint}`);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      this.ws.onclose = (event) => {
        console.log(`[WebSocket] Closed: ${event.code} - ${event.reason}`);
        
        // Attempt to reconnect if not intentionally closed
        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connect(endpoint), this.reconnectInterval);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      throw error;
    }
  }

  /**
   * Connect to device-specific updates
   */
  async connectToDevice(deviceId: string): Promise<void> {
    await this.connect(`/api/v1/ws/devices/${deviceId}`);
  }

  /**
   * Connect to all user devices
   */
  async connectToUserDevices(): Promise<void> {
    await this.connect('/api/v1/ws/user/devices');
  }

  /**
   * Connect to admin system monitoring
   */
  async connectToAdminSystem(): Promise<void> {
    await this.connect('/api/v1/ws/admin/system');
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('[WebSocket] Disconnected');
  }

  /**
   * Send message to server
   */
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  /**
   * Register message handler for specific message type
   */
  on(messageType: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Unregister message handler
   */
  off(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('[WebSocket] Received:', message);

    // Call specific handler if registered
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Call generic handler if registered
    const genericHandler = this.messageHandlers.get('*');
    if (genericHandler) {
      genericHandler(message);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();

// Export WebSocket states for convenience
export const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};
