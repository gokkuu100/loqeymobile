import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { assignDevice } from '../../api/devices';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';

const AddDeviceScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [serialNumber, setSerialNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddDevice = async () => {
    if (!serialNumber || !pin) {
      Alert.alert('Error', 'Please enter both serial number and PIN');
      return;
    }
    setLoading(true);
    try {
      // Call backend API to assign device
      const response = await assignDevice({ serial_number: serialNumber, pin });
      if (response.success) {
        Alert.alert('Success', 'Device added and linked to your account!');
        setSerialNumber('');
        setPin('');
      } else {
        Alert.alert('Error', response.error || response.data?.message || 'Failed to add device');
      }
    } catch (err) {
      let errorMsg = 'Failed to add device';
      if (err && typeof err === 'object' && 'message' in err) {
        errorMsg = (err as any).message;
      }
      Alert.alert('Error', errorMsg);
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Header title="Add Device" showBack={true} />
      
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
          <Ionicons name="hardware-chip-outline" size={48} color={colors.tint} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Link Your Device</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Enter the serial number and PIN found on your Loqey device
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Serial Number</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.tabIconDefault + '40' }]}>
              <Ionicons name="barcode-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g., LOQEY-12345"
                placeholderTextColor={colors.tabIconDefault}
                value={serialNumber}
                onChangeText={setSerialNumber}
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Device PIN</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.tabIconDefault + '40' }]}>
              <Ionicons name="keypad-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter 4-6 digit PIN"
                placeholderTextColor={colors.tabIconDefault}
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton, 
              { backgroundColor: colors.tint },
              (loading || !serialNumber || !pin) && styles.addButtonDisabled
            ]}
            onPress={handleAddDevice}
            disabled={loading || !serialNumber || !pin}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Device</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.helpBox, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.tint} />
            <Text style={[styles.helpText, { color: colors.tabIconDefault }]}>
              The serial number and PIN can be found on the label inside your Loqey device or in the packaging.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  helpBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AddDeviceScreen;
