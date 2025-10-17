import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '@/api/devices';

interface MemoizedDeviceCardProps {
  device: Device;
  isSelected: boolean;
  colors: any;
  onPress: (device: Device) => void;
  formatTimeAgo: (dateString: string) => string;
}

/**
 * Memoized device card - only re-renders when device data changes
 * Prevents unnecessary re-renders when other devices update
 */
export const MemoizedDeviceCard = memo(
  ({ device, isSelected, colors, onPress, formatTimeAgo }: MemoizedDeviceCardProps) => {
    return (
      <TouchableOpacity
        key={device.id}
        style={[
          styles.deviceOption,
          {
            backgroundColor: isSelected ? colors.tint + '20' : 'transparent',
            borderColor: isSelected ? colors.tint : colors.border,
          },
        ]}
        onPress={() => onPress(device)}
      >
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: colors.text }]}>
            {device.user_device_name || device.name || 'Unnamed Device'}
          </Text>
          <Text style={[styles.deviceSerial, { color: colors.tabIconDefault }]}>
            {device.serial_number} • {device.location_address || 'No location'}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: device.is_online ? '#4CAF50' : '#FF5252' },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.tabIconDefault }]}>
              {device.is_online ? 'Online' : 'Offline'} • Last seen{' '}
              {formatTimeAgo(device.last_heartbeat || device.last_activity || device.updated_at)}
            </Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  },
  // Custom comparison function - only re-render if these props change
  (prevProps, nextProps) => {
    return (
      prevProps.device.id === nextProps.device.id &&
      prevProps.device.name === nextProps.device.name &&
      prevProps.device.is_online === nextProps.device.is_online &&
      prevProps.device.lock_status === nextProps.device.lock_status &&
      prevProps.device.battery_level === nextProps.device.battery_level &&
      prevProps.device.last_heartbeat === nextProps.device.last_heartbeat &&
      prevProps.device.updated_at === nextProps.device.updated_at &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

MemoizedDeviceCard.displayName = 'MemoizedDeviceCard';

const styles = StyleSheet.create({
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceSerial: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
});
