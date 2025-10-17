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
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store';

const { width, height } = Dimensions.get('window');

export default function AssignDeviceScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Device</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Enter the serial number and PIN from your Loqey device
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Serial Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., a0764e34b8de"
                  value={serialNumber}
                  onChangeText={setSerialNumber}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                <Text style={styles.hint}>
                  Found on your device label
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PIN *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                <Text style={styles.hint}>
                  PIN provided by administrator
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Device Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Front Door Box"
                  value={deviceName}
                  onChangeText={setDeviceName}
                  autoCapitalize="words"
                  editable={!loading}
                  placeholderTextColor="#999"
                />
                <Text style={styles.hint}>
                  Give your device a friendly name
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAssignDevice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Device</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={20} color="#2196F3" />
                <Text style={styles.infoTitle}>Need help?</Text>
              </View>
              <Text style={styles.infoText}>
                • Serial number is on the device label
              </Text>
              <Text style={styles.infoText}>
                • PIN is provided by your admin
              </Text>
              <Text style={styles.infoText}>
                • Contact support for assistance
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    color: '#666',
    lineHeight: 22,
    marginBottom: height * 0.03,
  },
  form: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    minHeight: 50,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: height * 0.02,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: width * 0.045,
    marginTop: height * 0.03,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    marginBottom: 6,
    lineHeight: 20,
  },
});
