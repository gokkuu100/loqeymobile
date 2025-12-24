import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '../../store';
import { NotificationAPI } from '../../api/notifications';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const {
    notificationPreferences,
    loadNotificationPreferences,
    updateNotificationPreferences,
    notificationPreferencesLoading,
  } = useAppStore();

  const [localPrefs, setLocalPrefs] = useState({
    delivery_unlock_enabled: true,
    low_battery_enabled: true,
    failed_unlock_enabled: true,
    link_used_enabled: true,
    device_status_enabled: true,
    link_expiry_enabled: false,
    low_battery_threshold: 20,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  useEffect(() => {
    if (notificationPreferences) {
      setLocalPrefs({
        delivery_unlock_enabled: notificationPreferences.delivery_unlock_enabled,
        low_battery_enabled: notificationPreferences.low_battery_enabled,
        failed_unlock_enabled: notificationPreferences.failed_unlock_enabled,
        link_used_enabled: notificationPreferences.link_used_enabled,
        device_status_enabled: notificationPreferences.device_status_enabled,
        link_expiry_enabled: notificationPreferences.link_expiry_enabled,
        low_battery_threshold: notificationPreferences.low_battery_threshold,
      });
    }
  }, [notificationPreferences]);

  const handleToggle = (key: keyof typeof localPrefs) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
    setHasChanges(true);
  };

  const handleThresholdChange = (direction: 'increase' | 'decrease') => {
    setLocalPrefs((prev) => {
      const currentValue = prev.low_battery_threshold;
      let newValue = currentValue;

      if (direction === 'increase' && currentValue < 50) {
        newValue = Math.min(50, currentValue + 5);
      } else if (direction === 'decrease' && currentValue > 10) {
        newValue = Math.max(10, currentValue - 5);
      }

      return { ...prev, low_battery_threshold: newValue };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    const success = await updateNotificationPreferences(localPrefs);
    setIsSaving(false);

    if (success) {
      setHasChanges(false);
    } else {
      setErrorMessage('Failed to update notification preferences. Please check your connection and try again.');
    }
  };

  const handleTestNotification = async () => {
    try {
      Alert.alert('Test Notification', 'Sending test notification...');
      const response = await NotificationAPI.sendTestNotification();
      
      if (response.success) {
        Alert.alert('Success', 'Test notification sent! Check your device.');
      } else {
        Alert.alert('Error', response.error || 'Failed to send test notification');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  if (notificationPreferencesLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.icon }]}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.tabIconDefault + '30' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Notification Types Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Types</Text>
          <Text style={[styles.sectionDescription, { color: theme.icon }]}>
            Choose which notifications you want to receive
          </Text>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-open" size={24} color={theme.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Device Unlocks</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  When your device is unlocked by delivery or link
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.delivery_unlock_enabled}
              onValueChange={() => handleToggle('delivery_unlock_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.delivery_unlock_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="battery-dead" size={24} color="#ef4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Low Battery Alerts</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  When device battery is running low
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.low_battery_enabled}
              onValueChange={() => handleToggle('low_battery_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.low_battery_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="alert-circle" size={24} color="#f59e0b" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Failed Unlock Attempts</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  After 3 consecutive failed unlock attempts
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.failed_unlock_enabled}
              onValueChange={() => handleToggle('failed_unlock_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.failed_unlock_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="link" size={24} color={theme.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Access Link Used</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  When an access link is used to unlock
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.link_used_enabled}
              onValueChange={() => handleToggle('link_used_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.link_used_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color={theme.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Device Status Updates</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  When device goes online/offline
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.device_status_enabled}
              onValueChange={() => handleToggle('device_status_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.device_status_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="time" size={24} color="#ec4899" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Link Expiry Warnings</Text>
                <Text style={[styles.settingDescription, { color: theme.icon }]}>
                  When access links are about to expire
                </Text>
              </View>
            </View>
            <Switch
              value={localPrefs.link_expiry_enabled}
              onValueChange={() => handleToggle('link_expiry_enabled')}
              trackColor={{ false: '#d1d5db', true: theme.tint + '66' }}
              thumbColor={localPrefs.link_expiry_enabled ? theme.tint : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Low Battery Threshold */}
        {localPrefs.low_battery_enabled && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Low Battery Threshold</Text>
            <Text style={[styles.sectionDescription, { color: theme.icon }]}>
              Get notified when battery drops below this level
            </Text>

            <View style={[styles.thresholdContainer, { backgroundColor: theme.card, shadowColor: theme.icon }]}>
              <TouchableOpacity
                style={styles.thresholdButton}
                onPress={() => handleThresholdChange('decrease')}
                disabled={localPrefs.low_battery_threshold <= 10}
              >
                <Ionicons name="remove-circle" size={40} color={localPrefs.low_battery_threshold <= 10 ? '#d1d5db' : theme.tint} />
              </TouchableOpacity>

              <View style={styles.thresholdDisplay}>
                <Text style={[styles.thresholdValue, { color: theme.tint }]}>{localPrefs.low_battery_threshold}%</Text>
                <Text style={[styles.thresholdLabel, { color: theme.icon }]}>Battery Level</Text>
              </View>

              <TouchableOpacity
                style={styles.thresholdButton}
                onPress={() => handleThresholdChange('increase')}
                disabled={localPrefs.low_battery_threshold >= 50}
              >
                <Ionicons name="add-circle" size={40} color={localPrefs.low_battery_threshold >= 50 ? '#d1d5db' : theme.tint} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Test Notification */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.testButton, { backgroundColor: theme.tint }]} onPress={handleTestNotification}>
            <Ionicons name="notifications" size={24} color="#fff" />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
            {errorMessage && (
              <Text style={[styles.errorText, { color: '#ef4444', marginTop: 8 }]}>
                {errorMessage}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  thresholdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  thresholdButton: {
    padding: 8,
  },
  thresholdDisplay: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  thresholdValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  thresholdLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
  },
});

