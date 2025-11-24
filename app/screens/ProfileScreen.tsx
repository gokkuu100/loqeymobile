import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { webSocketService } from '@/services/WebSocketService';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  
  // Use selectors to prevent unnecessary re-renders from WebSocket updates
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const isLoading = useAppStore((state) => state.isLoading);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleEditProfile = () => {
    router.push('/screens/EditProfileScreen');
  };

  const handleChangePassword = () => {
    router.push('/screens/ChangePasswordScreen');
  };

  const handlePrivacySettings = () => {
    router.push('/screens/PrivacySettingsScreen');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              console.log('🚪 Signing out...');
              
              // Disconnect WebSocket
              console.log('📡 Disconnecting WebSocket...');
              webSocketService.disconnect();
              
              // Clear auth state
              console.log('🔐 Clearing auth state...');
              await logout();
              
              console.log('✅ Logout complete, navigating to signin...');
              
              // Navigate to sign in screen (replace entire stack)
              router.replace('/signin');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Header title="Profile" showBack={true} />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Profile Header */}
        <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {user?.first_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user ? `${user.first_name} ${user.last_name}` : 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>
          {user?.email || ''}
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
          onPress={handlePrivacySettings}
        >
          <Ionicons name="shield-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Privacy & Security
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>
      </View>

      {/* Sign Out Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: '#ef4444' }]}
          onPress={handleSignOut}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={24} color="white" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.versionText, { color: colors.tabIconDefault }]}>
          Version 1.0.0
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
