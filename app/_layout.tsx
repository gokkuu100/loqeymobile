import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastContainer from '@/components/Toast';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  // Initialize WebSocket at root level (only once)
  useWebSocket({ enabled: isAuthenticated });

  // Initialize push notifications at root level (only once)
  useNotifications({ enabled: isAuthenticated });

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          }}
        >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="deliveries" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="links" options={{ headerShown: false }} />
        <Stack.Screen name="unlock" options={{ headerShown: false }} />
        <Stack.Screen name="assign-device" options={{ headerShown: false }} />
        <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
        <Stack.Screen name="verify-email" options={{ headerShown: false }} />
        <Stack.Screen 
          name="screens/NotificationSettingsScreen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="screens/NotificationListScreen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="screens/HelpAndSupportScreen" 
          options={{ headerShown: false }} 
        />
        </Stack>
        <ToastContainer />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}