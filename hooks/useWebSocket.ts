/**
 * React Hook for WebSocket Connections
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { websocketClient, WebSocketMessage, WS_STATES } from '../api/websocket';

export interface UseWebSocketOptions {
  deviceId?: string;
  userDevices?: boolean;
  adminSystem?: boolean;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    deviceId,
    userDevices = false,
    adminSystem = false,
    autoConnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(WS_STATES.CLOSED);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    try {
      if (deviceId) {
        await websocketClient.connectToDevice(deviceId);
      } else if (userDevices) {
        await websocketClient.connectToUserDevices();
      } else if (adminSystem) {
        await websocketClient.connectToAdminSystem();
      }

      setIsConnected(true);
      setConnectionState(WS_STATES.OPEN);
      onConnect?.();
    } catch (error) {
      console.error('[useWebSocket] Connection error:', error);
      setIsConnected(false);
      setConnectionState(WS_STATES.CLOSED);
      onError?.(error);
    }
  }, [deviceId, userDevices, adminSystem, onConnect, onError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    websocketClient.disconnect();
    setIsConnected(false);
    setConnectionState(WS_STATES.CLOSED);
    onDisconnect?.();
  }, [onDisconnect]);

  /**
   * Send message to server
   */
  const sendMessage = useCallback((data: any) => {
    websocketClient.send(data);
  }, []);

  /**
   * Monitor connection state
   */
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const state = websocketClient.getState();
      setConnectionState(state);
      setIsConnected(state === WS_STATES.OPEN);
    }, 1000);

    return () => clearInterval(checkConnection);
  }, []);

  /**
   * Handle incoming messages
   */
  useEffect(() => {
    const messageHandler = (message: WebSocketMessage) => {
      setLastMessage(message);
      onMessage?.(message);
    };

    // Register message handler
    websocketClient.on('*', messageHandler);

    return () => {
      websocketClient.off('*');
    };
  }, [onMessage]);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionState,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
  };
}

/**
 * Hook specifically for device status updates
 */
export function useDeviceWebSocket(deviceId: string, options: Omit<UseWebSocketOptions, 'deviceId'> = {}) {
  const [deviceStatus, setDeviceStatus] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'device_update' && message.data) {
      const { type, payload } = message.data;

      switch (type) {
        case 'status':
          setDeviceStatus(payload);
          break;
        case 'battery':
          setBatteryLevel(payload.level);
          break;
        case 'heartbeat':
          setLockStatus(payload.lock_status);
          break;
        case 'responses':
          // Handle device responses
          console.log('[Device Response]', payload);
          break;
      }
    }

    options.onMessage?.(message);
  }, [options]);

  const wsHook = useWebSocket({
    ...options,
    deviceId,
    onMessage: handleMessage,
  });

  return {
    ...wsHook,
    deviceStatus,
    batteryLevel,
    lockStatus,
  };
}

/**
 * Hook for all user devices
 */
export function useUserDevicesWebSocket(options: Omit<UseWebSocketOptions, 'userDevices'> = {}) {
  const [updates, setUpdates] = useState<WebSocketMessage[]>([]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    setUpdates((prev) => [...prev, message].slice(-50)); // Keep last 50 updates
    options.onMessage?.(message);
  }, [options]);

  const wsHook = useWebSocket({
    ...options,
    userDevices: true,
    onMessage: handleMessage,
  });

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    ...wsHook,
    updates,
    clearUpdates,
  };
}
