import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Use selectors to prevent unnecessary re-renders from WebSocket updates
  const devices = useAppStore((state) => state.devices);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const unlinkDevice = useAppStore((state) => state.unlinkDevice);
  const updateDevice = useAppStore((state) => state.updateDevice);
  const loadDevices = useAppStore((state) => state.loadDevices);

  // Track which device options are expanded
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  // Load devices on first mount
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[SettingsScreen] Mounted - loading devices');
      loadDevices();
    }
  }, [isAuthenticated, loadDevices]);

  // Reload devices whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        console.log('[SettingsScreen] Focused - reloading devices');
        loadDevices();
      }
    }, [isAuthenticated, loadDevices])
  );

  const handleAddDevice = () => {
    router.push('/assign-device');
  };

  const handleEditDeviceName = (deviceId: string, currentName: string) => {
    Alert.prompt(
      'Edit Device Name',
      'Enter new device name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (newName: string | undefined) => {
            if (newName && newName.trim() && newName.trim() !== currentName) {
              console.log('[SettingsScreen] Updating device name:', { deviceId, newName });
              const success = await updateDevice(deviceId, { name: newName.trim() });
              if (success) {
                console.log('[SettingsScreen] Device name updated successfully');
                setExpandedDeviceId(null);
                // Add a small delay to ensure the update is reflected
                setTimeout(() => {
                  console.log('[SettingsScreen] Reloading devices after name update');
                  loadDevices();
                }, 500);
              }
            }
          }
        },
      ],
      'plain-text',
      currentName
    );
  };

  const handleRemoveDevice = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Unlink Device',
      `Are you sure you want to unlink "${deviceName}"? You can link it again later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlink', 
          style: 'destructive',
          onPress: async () => {
            await unlinkDevice(deviceId);
            setExpandedDeviceId(null);
          }
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement sign out logic
            Alert.alert('Success', 'Signed out successfully');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Header title="Settings" showBack={true} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Device Management Section */}
        <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device Management
        </Text>

        {devices.length > 0 ? (
          <View>
            {devices.map((device) => (
              <View key={device.id}>
                <TouchableOpacity 
                  style={[styles.deviceItem, { backgroundColor: colors.card }]}
                  onPress={() => setExpandedDeviceId(expandedDeviceId === device.id ? null : device.id)}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceName, { color: colors.text }]}>
                      {(device as any).user_device_name || device.name || 'Device'}
                    </Text>
                    <Text style={[styles.deviceLocation, { color: colors.tabIconDefault }]}>
                      {device.serial_number}
                    </Text>
                    <View style={styles.deviceStatusRow}>
                      <View style={styles.statusBadge}>
                        <Ionicons 
                          name={device.lock_status === 'locked' ? 'lock-closed' : 'lock-open'} 
                          size={12} 
                          color={device.lock_status === 'locked' ? '#F44336' : '#4CAF50'}
                        />
                        <Text style={[styles.statusText, { color: device.lock_status === 'locked' ? '#F44336' : '#4CAF50' }]}>
                          {device.lock_status === 'locked' ? 'Locked' : 'Unlocked'}
                        </Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: device.is_online ? '#4CAF50' : '#999' }]} />
                        <Text style={[styles.statusText, { color: device.is_online ? '#4CAF50' : '#999' }]}>
                          {device.is_online ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons 
                    name={expandedDeviceId === device.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.tabIconDefault} 
                  />
                </TouchableOpacity>

                {/* Expanded Options */}
                {expandedDeviceId === device.id && (
                  <View style={[styles.expandedOptions, { backgroundColor: colors.card, borderTopColor: colors.tabIconDefault + '30' }]}>
                    <TouchableOpacity 
                      style={styles.optionButton}
                      onPress={() => handleEditDeviceName(device.id, (device as any).user_device_name || device.name || 'Device')}
                    >
                      <Ionicons name="pencil-outline" size={20} color={colors.tint} />
                      <Text style={[styles.optionText, { color: colors.text }]}>
                        Edit Device Name
                      </Text>
                    </TouchableOpacity>

                    <View style={[styles.optionDivider, { backgroundColor: colors.tabIconDefault + '20' }]} />

                    <TouchableOpacity 
                      style={styles.optionButton}
                      onPress={() => handleRemoveDevice(device.id, (device as any).user_device_name || device.name || 'this device')}
                    >
                      <Ionicons name="link-outline" size={20} color="#F44336" />
                      <Text style={[styles.optionText, { color: '#F44336' }]}>
                        Unlink Device
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.noDevicesText, { color: colors.tabIconDefault }]}>
            No devices linked yet
          </Text>
        )}

        {/* Add Device Button - At the bottom */}
        <TouchableOpacity 
          style={[styles.addDeviceButton, { backgroundColor: colors.tint }]}
          onPress={handleAddDevice}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.addDeviceButtonText}>
            Add Device
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Account
        </Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Notifications', 'Notification settings coming soon!')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Notifications
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
        >
          <Ionicons name="shield-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Privacy & Security
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => Alert.alert('Help', 'Help & Support coming soon!')}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Help & Support
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={[styles.menuText, { color: '#F44336' }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  deviceLocation: {
    fontSize: 14,
  },
  deviceStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  deviceStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  expandedOptions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  optionDivider: {
    height: 1,
    marginVertical: 4,
  },
  noDevicesText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addDeviceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
