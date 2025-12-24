import { useEffect, useRef } from 'react';
import NotificationService from '../services/NotificationService';

interface UseNotificationsOptions {
  enabled?: boolean;
}

/**
 * Hook to initialize and manage push notifications
 * Should be called at the root level of the app
 */
export function useNotifications({ enabled = true }: UseNotificationsOptions = {}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled || initialized.current) return;

    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing push notifications...');
        await NotificationService.initialize();
        initialized.current = true;
      } catch (error) {
        console.error('❌ Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      // Optionally unregister token on unmount
      // NotificationService.unregisterToken();
    };
  }, [enabled]);

  return null;
}

