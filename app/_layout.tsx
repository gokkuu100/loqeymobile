import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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
        <Stack.Screen name="deliveries" options={{ 
          title: 'Deliveries',
          headerShown: true,
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} />
        <Stack.Screen name="events" options={{ 
          title: 'Events',
          headerShown: true,
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} />
        <Stack.Screen name="settings" options={{ 
          title: 'Settings',
          headerShown: true,
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} />
        <Stack.Screen name="profile" options={{ 
          title: 'Profile',
          headerShown: true,
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} />
        <Stack.Screen name="links" options={{ 
          title: 'Access Links',
          headerShown: true,
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} />
        <Stack.Screen name="unlock" options={{ 
          title: 'Unlock Device',
          headerShown: false,
        }} />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}