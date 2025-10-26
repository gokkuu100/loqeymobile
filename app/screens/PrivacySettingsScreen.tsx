import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/api/client';

interface PrivacySettings {
  data_sharing: {
    share_usage_data: boolean;
    share_location_data: boolean;
  };
  notifications: {
    delivery_alerts: boolean;
    security_alerts: boolean;
    marketing_emails: boolean;
  };
}

export default function PrivacySettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  
  const [settings, setSettings] = useState<PrivacySettings>({
    data_sharing: {
      share_usage_data: false,
      share_location_data: false,
    },
    notifications: {
      delivery_alerts: true,
      security_alerts: true,
      marketing_emails: false,
    },
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get('/user/privacy-settings');
      console.log('📥 Privacy settings response:', response);
      
      // If response has the correct structure, use it, otherwise use defaults
      if (response && response.data_sharing && response.notifications) {
        setSettings(response);
      } else {
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('❌ Failed to load privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrivacySettings) => {
    setIsSaving(true);
    try {
      await apiClient.put('/user/privacy-settings', newSettings);
      Alert.alert('Success', 'Privacy settings saved successfully');
    } catch (error: any) {
      console.error('❌ Failed to save privacy settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data including devices, access links, and delivery records will be permanently deleted.\n\nAre you absolutely sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    // Ask for password confirmation
    Alert.prompt(
      'Confirm Password',
      'Please enter your password to confirm account deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) {
              Alert.alert('Error', 'Password is required');
              return;
            }

            setIsDeletingAccount(true);
            try {
              await apiClient.post('/user/delete-account', {
                password,
              });

              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted. We\'re sorry to see you go.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await logout();
                      router.replace('/signin');
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('❌ Account deletion error:', error);
              const errorMessage = error?.response?.data?.detail || 'Failed to delete account. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const toggleDataSharing = (key: keyof PrivacySettings['data_sharing']) => {
    const newSettings = {
      ...settings,
      data_sharing: {
        ...settings.data_sharing,
        [key]: !settings.data_sharing[key],
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleNotification = (key: keyof PrivacySettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Privacy Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Account Info */}
      <View style={[styles.section, styles.infoCard, { backgroundColor: colors.card }]}>
        <Ionicons name="person-circle-outline" size={40} color={colors.tint} />
        <View style={styles.infoContent}>
          <Text style={[styles.infoName, { color: colors.text }]}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={[styles.infoEmail, { color: colors.tabIconDefault }]}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Data Sharing Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Sharing
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="analytics-outline" size={24} color={colors.tint} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Usage Data
              </Text>
              <Text style={[styles.settingDescription, { color: colors.tabIconDefault }]}>
                Help improve the app by sharing usage statistics
              </Text>
            </View>
          </View>
          <Switch
            value={settings.data_sharing.share_usage_data}
            onValueChange={() => toggleDataSharing('share_usage_data')}
            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
            disabled={isSaving}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="location-outline" size={24} color={colors.tint} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Location Data
              </Text>
              <Text style={[styles.settingDescription, { color: colors.tabIconDefault }]}>
                Share location for better delivery experiences
              </Text>
            </View>
          </View>
          <Switch
            value={settings.data_sharing.share_location_data}
            onValueChange={() => toggleDataSharing('share_location_data')}
            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
            disabled={isSaving}
          />
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notifications
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications-outline" size={24} color={colors.tint} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Delivery Alerts
              </Text>
              <Text style={[styles.settingDescription, { color: colors.tabIconDefault }]}>
                Get notified about delivery updates
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications.delivery_alerts}
            onValueChange={() => toggleNotification('delivery_alerts')}
            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
            disabled={isSaving}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.tint} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Security Alerts
              </Text>
              <Text style={[styles.settingDescription, { color: colors.tabIconDefault }]}>
                Important security notifications
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications.security_alerts}
            onValueChange={() => toggleNotification('security_alerts')}
            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
            disabled={isSaving}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingContent}>
            <Ionicons name="mail-outline" size={24} color={colors.tint} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Marketing Emails
              </Text>
              <Text style={[styles.settingDescription, { color: colors.tabIconDefault }]}>
                Receive updates and promotional content
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications.marketing_emails}
            onValueChange={() => toggleNotification('marketing_emails')}
            trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
            disabled={isSaving}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
          Danger Zone
        </Text>
        
        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: '#ef4444' }]}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
        >
          {isDeletingAccount ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={24} color="white" />
              <View style={styles.dangerButtonContent}>
                <Text style={styles.dangerButtonTitle}>Delete Account</Text>
                <Text style={styles.dangerButtonDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.dangerWarning, { color: colors.tabIconDefault }]}>
          This action cannot be undone. All your devices, access links, and delivery records will be permanently deleted.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoEmail: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dangerButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  dangerButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerButtonDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  dangerWarning: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

