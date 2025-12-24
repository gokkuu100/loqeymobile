import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

export default function AssignDeviceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [serialNumber, setSerialNumber] = useState('');
  const [pin, setPin] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);

  const assignDevice = useAppStore((state) => state.assignDevice);

    const handleAssignDevice = async () => {
    // Validation
    if (!serialNumber.trim()) {
      Alert.alert('Error', 'Please enter the serial number');
      return;
    }

    if (!pin.trim()) {
      Alert.alert('Error', 'Please enter the PIN');
      return;
    }

    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    setLoading(true);

    try {
      console.log('Assigning device with:', { 
        serial_number: serialNumber.trim(), 
        pin: pin.trim() 
      });

      const success = await assignDevice({
        serial_number: serialNumber.trim(),
        pin: pin.trim(),
        device_name: deviceName.trim() || undefined,
      });

      setLoading(false);

      if (success) {
        Alert.alert(
          'Success',
          'Device assigned successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to assign device. Please check your serial number and PIN.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Assign device error:', error);
      Alert.alert('Error', 'Failed to assign device. Please try again.');
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Back Button */}
        <View style={[styles.headerBar, { backgroundColor: colors.background, borderBottomColor: colors.tabIconDefault + '30' }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add Device</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
              Enter the serial number and PIN from your Loqey device
            </Text>

            <View style={[styles.form, { backgroundColor: colors.card }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Serial Number *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.tabIconDefault + '40' }]}
                  placeholder="e.g., a0764e34b8de"
                  value={serialNumber}
                  onChangeText={setSerialNumber}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor={colors.tabIconDefault}
                />
                <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
                  Found on your device label
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>PIN *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.tabIconDefault + '40' }]}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor={colors.tabIconDefault}
                />
                <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
                  PIN provided by administrator
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Device Name (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.tabIconDefault + '40' }]}
                  placeholder="e.g., Front Door Box"
                  value={deviceName}
                  onChangeText={setDeviceName}
                  autoCapitalize="words"
                  editable={!loading}
                  placeholderTextColor={colors.tabIconDefault}
                />
                <Text style={[styles.hint, { color: colors.tabIconDefault }]}>
                  Give your device a friendly name
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint, shadowColor: colors.tint }, loading && styles.buttonDisabled]}
              onPress={handleAssignDevice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Device</Text>
              )}
            </TouchableOpacity>

            <View style={[styles.infoBox, { backgroundColor: colors.tint + '20', borderLeftColor: colors.tint }]}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color={colors.tint} />
                <Text style={[styles.infoTitle, { color: colors.tint }]}>Need help?</Text>
              </View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Serial number is on the device label
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • PIN is provided by your admin
              </Text>
              <Text style={[styles.infoText, { color: colors.text }]}>
                • Contact support for assistance
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40, // Same width as back button for centering
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: width * 0.05,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: height * 0.03,
  },
  form: {
    borderRadius: 12,
    padding: width * 0.05,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: height * 0.025,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: height * 0.02,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: 12,
    padding: width * 0.045,
    marginTop: height * 0.03,
    borderLeftWidth: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 20,
  },
});
