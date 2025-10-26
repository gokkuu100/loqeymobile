import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore, User } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/api/client';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const user = useAppStore((state) => state.user);
  const authToken = useAppStore((state) => state.authToken);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [residentState, setResidentState] = useState(user?.resident_state || '');
  const [zipCode, setZipCode] = useState(user?.zip_code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Debug: Log auth state
  useEffect(() => {
    console.log('🔐 Auth State Check:', {
      hasUser: !!user,
      hasToken: !!authToken,
      isAuthenticated,
      userEmail: user?.email,
    });
  }, [user, authToken, isAuthenticated]);

  // Check if there are any changes
  useEffect(() => {
    const changed = 
      firstName !== (user?.first_name || '') ||
      lastName !== (user?.last_name || '') ||
      phoneNumber !== (user?.phone_number || '') ||
      residentState !== (user?.resident_state || '') ||
      zipCode !== (user?.zip_code || '');
    
    setHasChanges(changed);
  }, [firstName, lastName, phoneNumber, residentState, zipCode, user]);

  const handleSave = async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    if (!residentState.trim() || !zipCode.trim()) {
      Alert.alert('Error', 'State and ZIP code are required');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        resident_state: residentState.trim(),
        zip_code: zipCode.trim(),
      };

      if (phoneNumber.trim()) {
        updateData.phone_number = phoneNumber.trim();
      }

      const response = await apiClient.put<User>('/user/profile', updateData);
      
      console.log('📥 Full API response:', JSON.stringify(response, null, 2));
      
      // The API client wraps responses in { success, data, status }
      // We need to extract the actual user data from response.data
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile');
      }
      
      const userData: User = response.data;
      console.log('👤 Extracted user data:', JSON.stringify(userData, null, 2));
      console.log('🔍 User data has email?', userData.email);
      console.log('🔍 User data keys:', Object.keys(userData));
      
      // Validate that we have a proper user object
      if (!userData.email || !userData.id) {
        console.error('❌ Invalid user data structure!', userData);
        throw new Error('Received invalid user data from server');
      }
      
      // Verify auth state before update
      const currentState = useAppStore.getState();
      console.log('🔐 Current auth state before update:', {
        hasUser: !!currentState.user,
        hasToken: !!currentState.authToken,
        isAuthenticated: currentState.isAuthenticated,
        userEmail: currentState.user?.email,
      });
      
      // Update user in store using the dedicated function
      console.log('🔄 Calling updateUserProfile with:', userData.email);
      updateUserProfile(userData);
      
      // Verify auth state after update
      const newState = useAppStore.getState();
      console.log('🔐 Auth state after update:', {
        hasUser: !!newState.user,
        hasToken: !!newState.authToken,
        isAuthenticated: newState.isAuthenticated,
      });
      
      if (!newState.authToken || !newState.isAuthenticated) {
        console.error('❌ Auth state was corrupted during update!');
        Alert.alert('Error', 'Session error. Please log in again.');
        return;
      }
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.detail || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Email Display (Read-only) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Email Address
          </Text>
          <View style={[styles.inputDisabled, { backgroundColor: colors.card }]}>
            <Ionicons name="mail-outline" size={20} color={colors.tabIconDefault} />
            <Text style={[styles.inputTextDisabled, { color: colors.tabIconDefault }]}>
              {user?.email}
            </Text>
          </View>
          <Text style={[styles.helpText, { color: colors.tabIconDefault }]}>
            Email address cannot be changed
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            First Name *
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="person-outline" size={20} color={colors.tint} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="First Name"
              placeholderTextColor={colors.tabIconDefault}
              value={firstName}
              onChangeText={setFirstName}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Last Name *
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="person-outline" size={20} color={colors.tint} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Last Name"
              placeholderTextColor={colors.tabIconDefault}
              value={lastName}
              onChangeText={setLastName}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            Phone Number
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="call-outline" size={20} color={colors.tint} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number"
              placeholderTextColor={colors.tabIconDefault}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            State *
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="location-outline" size={20} color={colors.tint} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="State"
              placeholderTextColor={colors.tabIconDefault}
              value={residentState}
              onChangeText={setResidentState}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>
            ZIP Code *
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="map-outline" size={20} color={colors.tint} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ZIP Code"
              placeholderTextColor={colors.tabIconDefault}
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: hasChanges && !isLoading ? colors.tint : colors.tabIconDefault,
              opacity: hasChanges && !isLoading ? 1 : 0.5
            }
          ]}
          onPress={handleSave}
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Required Fields Note */}
        <Text style={[styles.requiredNote, { color: colors.tabIconDefault }]}>
          * Required fields
        </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  inputDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    opacity: 0.6,
  },
  inputTextDisabled: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
});

