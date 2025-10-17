import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { assignDevice } from '../../api/devices';

const AddDeviceScreen = () => {
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
    <View style={styles.container}>
      <Text style={styles.title}>Add Device</Text>
      <TextInput
        style={styles.input}
        placeholder="Serial Number"
        value={serialNumber}
        onChangeText={setSerialNumber}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        autoCapitalize="none"
      />
      <Button title="Add Device" onPress={handleAddDevice} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default AddDeviceScreen;
