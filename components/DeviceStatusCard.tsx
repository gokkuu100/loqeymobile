/**
 * Device Status Card with Real-time WebSocket Updates
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeviceWebSocket } from '@/hooks/useWebSocket';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DeviceStatusCardProps {
  deviceId: string;
  deviceName: string;
  onStatusUpdate?: (status: any) => void;
}

export function DeviceStatusCard({ deviceId, deviceName, onStatusUpdate }: DeviceStatusCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    isConnected,
    deviceStatus,
    batteryLevel,
    lockStatus,
    lastMessage,
  } = useDeviceWebSocket(deviceId, {
    autoConnect: true,
    onMessage: (message) => {
      console.log('[Device Status] Update received:', message);
      if (message.data) {
        onStatusUpdate?.(message.data);
      }
    },
    onConnect: () => {
      console.log(`[Device Status] Connected to ${deviceId}`);
    },
    onDisconnect: () => {
      console.log(`[Device Status] Disconnected from ${deviceId}`);
    },
  });

  useEffect(() => {
    if (lastMessage) {
      console.log('[Device Status] Last message:', lastMessage);
    }
  }, [lastMessage]);

  const getBatteryIcon = () => {
    if (batteryLevel === null) return 'battery-dead-outline';
    if (batteryLevel > 75) return 'battery-full';
    if (batteryLevel > 50) return 'battery-half';
    if (batteryLevel > 25) return 'battery-charging-outline';
    return 'battery-dead';
  };

  const getBatteryColor = () => {
    if (batteryLevel === null) return colors.tabIconDefault;
    if (batteryLevel > 50) return '#4CAF50';
    if (batteryLevel > 25) return '#FFA726';
    return '#F44336';
  };

  const getLockIcon = () => {
    return lockStatus === 'locked' ? 'lock-closed' : 'lock-open';
  };

  const getLockColor = () => {
    return lockStatus === 'locked' ? '#4CAF50' : '#FFA726';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.deviceName, { color: colors.text }]}>{deviceName}</Text>
        <View style={styles.connectionIndicator}>
          {isConnected ? (
            <>
              <View style={styles.connectedDot} />
              <Text style={[styles.connectionText, { color: '#4CAF50' }]}>Live</Text>
            </>
          ) : (
            <>
              <View style={styles.disconnectedDot} />
              <Text style={[styles.connectionText, { color: colors.tabIconDefault }]}>Offline</Text>
            </>
          )}
        </View>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusRow}>
        {/* Lock Status */}
        <View style={styles.statusItem}>
          <Ionicons
            name={getLockIcon()}
            size={24}
            color={getLockColor()}
          />
          <Text style={[styles.statusLabel, { color: colors.tabIconDefault }]}>Lock</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>
            {lockStatus ? lockStatus.charAt(0).toUpperCase() + lockStatus.slice(1) : 'Unknown'}
          </Text>
        </View>

        {/* Battery Status */}
        <View style={styles.statusItem}>
          <Ionicons
            name={getBatteryIcon()}
            size={24}
            color={getBatteryColor()}
          />
          <Text style={[styles.statusLabel, { color: colors.tabIconDefault }]}>Battery</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>
            {batteryLevel !== null ? `${batteryLevel}%` : '--'}
          </Text>
        </View>

        {/* Signal Status */}
        <View style={styles.statusItem}>
          <Ionicons
            name={isConnected ? 'wifi' : 'wifi-outline'}
            size={24}
            color={isConnected ? '#4CAF50' : colors.tabIconDefault}
          />
          <Text style={[styles.statusLabel, { color: colors.tabIconDefault }]}>Signal</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>
            {isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Last Update */}
      {lastMessage && (
        <View style={styles.lastUpdate}>
          <Ionicons name="time-outline" size={14} color={colors.tabIconDefault} />
          <Text style={[styles.lastUpdateText, { color: colors.tabIconDefault }]}>
            Updated {new Date(lastMessage.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  disconnectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9E9E9E',
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  lastUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  lastUpdateText: {
    fontSize: 12,
    marginLeft: 4,
  },
});
