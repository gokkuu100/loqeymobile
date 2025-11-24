import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  showMenu = false,
  showNotifications = false,
  onMenuPress,
  onNotificationPress,
  rightElement,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.card }]}>
      {/* Left Side */}
      {showBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : showMenu ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      {/* Center Title */}
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        {title || 'loqey'}
      </Text>

      {/* Right Side */}
      {rightElement ? (
        rightElement
      ) : showNotifications ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
});
