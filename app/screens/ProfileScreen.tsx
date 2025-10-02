import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { user } = useAppStore();

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change feature coming soon!');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user.name}
        </Text>
        <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>
          {user.email}
        </Text>
      </View>

      {/* Profile Actions */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={handleEditProfile}
        >
          <Ionicons name="person-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Edit Profile Information
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={handleChangePassword}
        >
          <Ionicons name="lock-closed-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Change Password
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Email Preferences', 'Email preferences coming soon!')}
        >
          <Ionicons name="mail-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Email Preferences
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Privacy Settings', 'Privacy settings coming soon!')}
        >
          <Ionicons name="shield-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Privacy Settings
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
});
