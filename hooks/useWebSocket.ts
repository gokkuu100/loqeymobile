import { useEffect, useRef } from 'react';
import { webSocketService } from '../services/WebSocketService';
import { useAppStore } from '../store';

export interface UseWebSocketOptions {
  enabled?: boolean;
}

/**
 * React hook to manage WebSocket connection lifecycle
 * Uses a singleton service to maintain persistent connection
 * 
 * CRITICAL: This hook should only be used ONCE in your app root
 * Multiple instances will cause connection churn!
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { enabled = true } = options;
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only connect if authenticated and enabled
    if (!isAuthenticated || !enabled) {
      // Disconnect if not authenticated
      if (hasInitialized.current) {
        console.log('[useWebSocket] Not authenticated - disconnecting');
        webSocketService.disconnect();
        hasInitialized.current = false;
      }
      return;
    }

    // Prevent duplicate initialization
    if (hasInitialized.current) {
      console.log('[useWebSocket] Already initialized, skipping');
      return;
    }

    // Connect to WebSocket (singleton will handle duplicate calls)
    console.log('[useWebSocket] Initializing WebSocket connection');
    webSocketService.connect();
    hasInitialized.current = true;

    // ONLY disconnect on unmount (when component is actually destroyed)
    // Don't disconnect on re-renders or in strict mode
    return () => {
      console.log('[useWebSocket] Hook cleanup - checking if should disconnect');
      // Only disconnect if not authenticated anymore
      const currentAuthState = useAppStore.getState().isAuthenticated;
      if (!currentAuthState) {
        console.log('[useWebSocket] Not authenticated on cleanup - disconnecting');
        webSocketService.disconnect();
        hasInitialized.current = false;
      }
    };
  }, [isAuthenticated, enabled]); // Only re-run if auth or enabled changes

  return {
    isConnected: webSocketService.getConnectionStatus(),
  };
}
