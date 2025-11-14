import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Activity, Delivery } from '@/store/types';
import { useAppStore } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [deviceSelectorVisible, setDeviceSelectorVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [linkTypeModalVisible, setLinkTypeModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use selectors to prevent unnecessary re-renders from WebSocket updates
  const user = useAppStore((state) => state.user);
  const devices = useAppStore((state) => state.devices);
  const selectedDevice = useAppStore((state) => state.selectedDevice);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const linksStats = useAppStore((state) => state.linksStats);
  const setSelectedDevice = useAppStore((state) => state.setSelectedDevice);
  const unlockDevice = useAppStore((state) => state.unlockDevice);
  const loadDevices = useAppStore((state) => state.loadDevices);
  const loadLinksStats = useAppStore((state) => state.loadLinksStats);
  const logout = useAppStore((state) => state.logout);

  // WebSocket is now managed at root level in _layout.tsx
  // This prevents multiple instances and connection churn

  // Update current time every 5 seconds to refresh "time ago" displays
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // 5 seconds for responsive updates

    return () => clearInterval(timer);
  }, []);

  // Load devices on first mount
  useEffect(() => {
    if (isAuthenticated) {
      loadDevices();
      loadLinksStats();
    }
  }, [isAuthenticated]);

  // Reload devices and stats whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        console.log('🔄 Home screen focused - reloading devices and stats');
        loadDevices();
        loadLinksStats();
      }
    }, [isAuthenticated, loadDevices, loadLinksStats])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLockToggle = async () => {
    if (!selectedDevice) return;
    
    Alert.alert(
      'Device Control',
      `Are you sure you want to ${selectedDevice.lock_status === 'locked' ? 'unlock' : 'lock'} ${selectedDevice.name || 'this device'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            const success = await unlockDevice(selectedDevice.id);
            if (!success) {
              Alert.alert('Error', 'Failed to toggle device status. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleAddDevice = () => {
    router.push('/assign-device');
  };

  const handleViewActiveLinks = () => {
    // Navigate to links screen filtered by active status
    router.push('/links');
  };

  const handleViewDeliveryHistory = () => {
    // Navigate to delivery history screen with filters
    router.push('/screens/DeliveryHistoryScreen' as any);
  };

  const handleLinkTypeSelection = (linkType: 'tracking_number' | 'access_code') => {
    setLinkTypeModalVisible(false);
    router.push({
      pathname: '/links' as any,
      params: { createLinkType: linkType }
    });
  };

  const LinkTypeModal = () => (
    <Modal
      visible={linkTypeModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLinkTypeModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.linkTypeModal, { backgroundColor: colors.card }]}>
          <Text style={[styles.linkModalTitle, { color: colors.text }]}>
            Create Access Link
          </Text>
          <Text style={[styles.linkModalSubtitle, { color: colors.tabIconDefault }]}>
            Choose the type of link to create:
          </Text>

          <TouchableOpacity 
            style={[styles.linkTypeOption, { borderColor: colors.tabIconDefault + '30' }]}
            onPress={() => handleLinkTypeSelection('tracking_number')}
          >
            <View style={styles.linkTypeContent}>
              <Text style={[styles.linkTypeTitle, { color: colors.text }]}>
                Tracking Number
              </Text>
              <Text style={[styles.linkTypeDescription, { color: colors.tabIconDefault }]}>
                For deliveries with tracking codes from online shopping (Amazon, Alibaba, etc.)
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.linkTypeOption, { borderColor: colors.tabIconDefault + '30' }]}
            onPress={() => handleLinkTypeSelection('access_code')}
          >
            <View style={styles.linkTypeContent}>
              <Text style={[styles.linkTypeTitle, { color: colors.text }]}>
                Access Code
              </Text>
              <Text style={[styles.linkTypeDescription, { color: colors.tabIconDefault }]}>
                For courier deliveries where you share a secret code
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.linkModalCancelButton, { backgroundColor: colors.tabIconDefault + '20' }]}
            onPress={() => setLinkTypeModalVisible(false)}
          >
            <Text style={[styles.linkModalCancelText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const MenuModal = () => (
    <Modal
      visible={menuVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setMenuVisible(false)}
      >
        <View style={[styles.menuModal, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push('/settings');
            }}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push('/profile' as any);
            }}
          >
            <Ionicons name="person-outline" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              handleAddDevice();
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Add Device</Text>
          </TouchableOpacity>
          
          <View style={styles.menuDivider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      router.replace('/signin' as any);
                    }
                  },
                ]
              );
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={[styles.menuText, { color: '#F44336' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinkTypeModal />
      <MenuModal />
      
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.card }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>loqey</Text>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.first_name || 'User'}
          </Text>
        </View>

        {/* No Devices Message */}
        {devices.length === 0 && (
          <View style={[styles.noDevicesContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="cube-outline" size={64} color={colors.tabIconDefault} style={styles.noDevicesIcon} />
            <Text style={[styles.noDevicesTitle, { color: colors.text }]}>
              No devices added
            </Text>
            <Text style={[styles.noDevicesSubtitle, { color: colors.tabIconDefault }]}>
              Add a device to start managing your smart lockbox
            </Text>
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
        )}

        {/* Device Selector */}
        {devices.length > 1 && (
          <TouchableOpacity 
            style={[styles.deviceSelector, { backgroundColor: colors.card }]}
            onPress={() => setDeviceSelectorVisible(true)}
          >
            <Text style={[styles.selectorLabel, { color: colors.text }]}>
              Current Device: {selectedDevice?.name || 'None'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}

        {/* Main Lock/Unlock Circle - Only show when devices exist */}
        {devices.length > 0 && selectedDevice && (
          <View style={styles.lockSection}>
            {/* Device Info Card */}
            <View style={[styles.deviceInfoCard, { backgroundColor: colors.card }]}>
              <View style={styles.infoRow}>
                {/* Battery */}
                <View style={styles.infoItem}>
                  <Ionicons 
                    name={
                      selectedDevice.battery_level && selectedDevice.battery_level > 75 ? 'battery-full' :
                      selectedDevice.battery_level && selectedDevice.battery_level > 50 ? 'battery-half' :
                      selectedDevice.battery_level && selectedDevice.battery_level > 25 ? 'battery-charging-outline' :
                      'battery-dead'
                    }
                    size={20}
                    color={
                      selectedDevice.battery_level && selectedDevice.battery_level > 50 ? '#4CAF50' :
                      selectedDevice.battery_level && selectedDevice.battery_level > 25 ? '#FFA726' :
                      '#F44336'
                    }
                  />
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedDevice.battery_level !== undefined ? `${selectedDevice.battery_level}%` : '--'}
                  </Text>
                </View>

                {/* Online Status */}
                <View style={styles.infoItem}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: selectedDevice.is_online ? '#4CAF50' : '#9E9E9E' }
                  ]} />
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {selectedDevice.is_online ? 'Online' : 'Offline'}
                  </Text>
                </View>

                {/* Last Seen */}
                <View style={styles.infoItem}>
                  <Ionicons 
                    name="time-outline" 
                    size={18} 
                    color={colors.tabIconDefault}
                  />
                  <Text style={[styles.infoValue, { color: colors.tabIconDefault, fontSize: 12 }]}>
                    {selectedDevice.last_heartbeat 
                      ? (() => {
                          const lastSeen = new Date(selectedDevice.last_heartbeat);
                          const diffMs = currentTime.getTime() - lastSeen.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMins / 60);
                          const diffDays = Math.floor(diffHours / 24);
                          
                          if (diffMins < 1) return 'Just now';
                          if (diffMins < 60) return `${diffMins}m ago`;
                          if (diffHours < 24) return `${diffHours}h ago`;
                          return `${diffDays}d ago`;
                        })()
                      : 'Never'
                    }
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.lockCircle,
                { 
                  borderColor: selectedDevice.lock_status === 'unlocked' 
                    ? '#4CAF50' 
                    : '#9E9E9E',
                  opacity: isLoading ? 0.6 : 1
                }
              ]}
              onPress={handleLockToggle}
              disabled={isLoading}
            >
              <Ionicons 
                name={selectedDevice.lock_status === 'unlocked' ? 'lock-open' : 'lock-closed'}
                size={48}
                color={selectedDevice.lock_status === 'unlocked' ? '#4CAF50' : '#9E9E9E'}
              />
              <Text style={[
                styles.lockStatus,
                { 
                  color: selectedDevice.lock_status === 'unlocked' ? '#4CAF50' : '#9E9E9E' 
                }
              ]}>
                {selectedDevice.lock_status === 'unlocked' ? 'Unlocked' : 'Locked'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Action Buttons - Only show when devices exist */}
        {devices.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleViewActiveLinks}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="link-outline" size={24} color={colors.tint} />
              <Text style={[styles.actionButtonLabel, { color: colors.text }]}>
                {linksStats?.active_links || 0} active
              </Text>
              <Text style={[styles.actionButtonSubLabel, { color: colors.tabIconDefault }]}>
                delivery links
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={handleViewDeliveryHistory}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <Text style={[styles.actionButtonLabel, { color: colors.text }]}>
                {linksStats?.deliveries_today || 0} events
              </Text>
              <Text style={[styles.actionButtonSubLabel, { color: colors.tabIconDefault }]}>
                recorded today
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        )}

        {/* Control Section */}
        {devices.length > 0 && isAuthenticated && selectedDevice && (
          <View style={styles.controlSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Device Control
            </Text>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.card }]}
              onPress={() => setLinkTypeModalVisible(true)}
            >
              <View style={styles.controlButtonContent}>
                <Ionicons name="link-outline" size={24} color={colors.tint} />
                <View style={styles.controlButtonText}>
                  <Text style={[styles.controlButtonLabel, { color: colors.text }]}>
                    Access Links
                  </Text>
                  <Text style={[styles.controlButtonSubLabel, { color: colors.tabIconDefault }]}>
                    Create and manage device access
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Device Button - Only show when devices exist */}
        {devices.length > 0 && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={handleAddDevice}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        )}
      </ScrollView>

      {/* Device Selector Modal */}
      <Modal
        visible={deviceSelectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeviceSelectorVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setDeviceSelectorVisible(false)}
        >
          <View style={[styles.deviceModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Device
            </Text>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceOption,
                  selectedDevice?.id === device.id && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  setSelectedDevice(device);
                  setDeviceSelectorVisible(false);
                }}
              >
                <View style={styles.deviceOptionContent}>
                  <Text style={[styles.deviceOptionName, { color: colors.text }]}>
                    {device.name}
                  </Text>
                  <Text style={[styles.deviceOptionLocation, { color: colors.tabIconDefault }]}>
                    {device.location_address || 'No location set'}
                  </Text>
                </View>
                {selectedDevice?.id === device.id && (
                  <Ionicons name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRight: {
    width: 32, // Same width as menu button for centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '300',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  deviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  lockSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deviceInfoCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lockCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lockStatus: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtonSubLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceModal: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceOptionContent: {
    flex: 1,
  },
  deviceOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  deviceOptionLocation: {
    fontSize: 14,
  },
  menuModal: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  controlSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  controlButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  controlButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  controlButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  controlButtonSubLabel: {
    fontSize: 14,
  },
  linkTypeModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  linkModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  linkModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  linkTypeOption: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  linkTypeContent: {
    gap: 8,
  },
  linkTypeTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkTypeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  linkModalCancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  linkModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noDevicesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noDevicesIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  noDevicesTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDevicesSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addDeviceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
