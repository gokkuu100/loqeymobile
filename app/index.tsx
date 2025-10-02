import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Activity, Delivery } from '@/store/types';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  
  const {
    user,
    devices,
    currentDevice,
    deliveries,
    activities,
    isAuthenticated,
    isLoading,
    setCurrentDevice,
    toggleDeviceStatus,
    logout,
    initialize,
  } = useAppStore();

  // Initialize the app on first load
  useEffect(() => {
    initialize();
  }, [initialize]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLockToggle = async () => {
    if (!currentDevice) return;
    
    Alert.alert(
      'Device Control',
      `Are you sure you want to ${currentDevice.status === 'locked' ? 'unlock' : 'lock'} ${currentDevice.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            const success = await toggleDeviceStatus(currentDevice.id);
            if (!success) {
              Alert.alert('Error', 'Failed to toggle device status. Please try again.');
            }
          }
        },
      ]
    );
  };

  const upcomingDeliveries = deliveries.filter((delivery: Delivery) => delivery.status === 'pending');
  const todayActivities = activities.filter((activity: Activity) => 
    new Date(activity.timestamp).toDateString() === new Date().toDateString()
  );

  const handleAddDevice = () => {
    Alert.alert('Add Device', 'Device addition feature coming soon!');
  };

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
              router.push('/signin' as any);
            }}
          >
            <Ionicons name="log-in-outline" size={24} color={colors.text} />
            <Text style={[styles.menuText, { color: colors.text }]}>Sign In</Text>
          </TouchableOpacity>
          
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
            {user.name}
          </Text>
        </View>

        {/* Device Selector */}
        {devices.length > 1 && (
          <TouchableOpacity 
            style={[styles.deviceSelector, { backgroundColor: colors.card }]}
            onPress={() => setDeviceSelectorVisible(true)}
          >
            <Text style={[styles.selectorLabel, { color: colors.text }]}>
              Current Device: {currentDevice?.name || 'None'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        )}

        {/* Main Lock/Unlock Circle */}
        {currentDevice && (
          <View style={styles.lockSection}>
            <TouchableOpacity 
              style={[
                styles.lockCircle,
                { 
                  borderColor: currentDevice.status === 'unlocked' 
                    ? '#4CAF50' 
                    : '#9E9E9E',
                  opacity: isLoading ? 0.6 : 1
                }
              ]}
              onPress={handleLockToggle}
              disabled={isLoading}
            >
              <Ionicons 
                name={currentDevice.status === 'unlocked' ? 'lock-open' : 'lock-closed'}
                size={48}
                color={currentDevice.status === 'unlocked' ? '#4CAF50' : '#9E9E9E'}
              />
              <Text style={[
                styles.lockStatus,
                { 
                  color: currentDevice.status === 'unlocked' ? '#4CAF50' : '#9E9E9E' 
                }
              ]}>
                {currentDevice.status === 'unlocked' ? 'Unlocked' : 'Locked'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/deliveries')}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="cube-outline" size={24} color={colors.tint} />
              <Text style={[styles.actionButtonLabel, { color: colors.text }]}>
                {upcomingDeliveries.length} upcoming
              </Text>
              <Text style={[styles.actionButtonSubLabel, { color: colors.tabIconDefault }]}>
                deliveries
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/events')}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <Text style={[styles.actionButtonLabel, { color: colors.text }]}>
                {todayActivities.length} events
              </Text>
              <Text style={[styles.actionButtonSubLabel, { color: colors.tabIconDefault }]}>
                recorded today
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Control Section */}
        {isAuthenticated && currentDevice && (
          <View style={styles.controlSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Device Control
            </Text>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/links' as any)}
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

        {/* Add Device Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={handleAddDevice}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
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
                  currentDevice?.id === device.id && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  setCurrentDevice(device);
                  setDeviceSelectorVisible(false);
                }}
              >
                <View style={styles.deviceOptionContent}>
                  <Text style={[styles.deviceOptionName, { color: colors.text }]}>
                    {device.name}
                  </Text>
                  <Text style={[styles.deviceOptionLocation, { color: colors.tabIconDefault }]}>
                    {device.location}
                  </Text>
                </View>
                {currentDevice?.id === device.id && (
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
});
