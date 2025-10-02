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

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { devices, removeDevice, updateDeviceName } = useAppStore();

  const handleAddDevice = () => {
    Alert.alert('Add Device', 'Device addition feature coming soon!');
  };

  const handleEditDeviceName = (deviceId: string, currentName: string) => {
    Alert.prompt(
      'Edit Device Name',
      'Enter new device name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: (newName) => {
            if (newName && newName.trim()) {
              updateDeviceName(deviceId, newName.trim());
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
      'Remove Device',
      `Are you sure you want to remove "${deviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeDevice(deviceId)
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Device Management Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device Management
        </Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={handleAddDevice}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.tint} />
          <Text style={[styles.menuText, { color: colors.text }]}>
            Add Device
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
        </TouchableOpacity>

        {devices.map((device) => (
          <View key={device.id} style={[styles.deviceItem, { backgroundColor: colors.card }]}>
            <View style={styles.deviceInfo}>
              <Text style={[styles.deviceName, { color: colors.text }]}>
                {device.name}
              </Text>
              <Text style={[styles.deviceLocation, { color: colors.tabIconDefault }]}>
                {device.location}
              </Text>
            </View>
            <View style={styles.deviceActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditDeviceName(device.id, device.name)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.tint} />
              </TouchableOpacity>
              {devices.length > 1 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveDevice(device.id, device.name)}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
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
  );
}

const styles = StyleSheet.create({
  container: {
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
