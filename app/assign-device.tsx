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
} from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '@/store';

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
      const success = await assignDevice({
        serial_number: serialNumber.trim(),
        pin: pin.trim(),
        device_name: deviceName.trim() || undefined,
      });

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
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to assign device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Device</Text>
          <Text style={styles.subtitle}>
            Enter the serial number and PIN from your Loqey Box
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Serial Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., SN001-2024-001"
              value={serialNumber}
              onChangeText={setSerialNumber}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
            />
            <Text style={styles.hint}>
              Found on the bottom of your device
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PIN *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              maxLength={10}
              secureTextEntry
              editable={!loading}
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
            />
            <Text style={styles.hint}>
              Give your device a friendly name
            </Text>
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

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Need help?</Text>
          <Text style={styles.infoText}>
            • Serial number is located on the bottom of your Loqey Box
          </Text>
          <Text style={styles.infoText}>
            • PIN is provided by your system administrator
          </Text>
          <Text style={styles.infoText}>
            • Contact support if you don't have these details
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    marginBottom: 4,
  },
});
