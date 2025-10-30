import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { AuthAPI } from '@/api/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CompleteProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const { updateUserProfile } = useAppStore();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    state: '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const response = await AuthAPI.completeProfile({
        email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber || undefined,
        resident_state: formData.state,
        zip_code: formData.zipCode,
      });

      if (response.success && response.data) {
        // Store refresh token
        if (response.data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
        }

        // Update store with user data
        useAppStore.setState({
          authToken: response.data.access_token,
          user: response.data.user,
          isAuthenticated: true,
        });

        // Load initial data
        const { loadDevices, loadLinks } = useAppStore.getState();
        Promise.all([
          loadDevices().catch(err => console.warn('Device load failed:', err)),
          loadLinks().catch(err => console.warn('Links load failed:', err)),
        ]);

        // Navigate to home
        router.replace('/');
      } else {
        Alert.alert('Error', response.error || 'Failed to complete profile. Please try again.');
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    keyboardType: 'default' | 'phone-pad' | 'numeric' | 'email-address' = 'default',
    secureTextEntry: boolean = false,
    showPasswordToggle: boolean = false,
    passwordVisible?: boolean,
    onTogglePassword?: () => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithIcon,
            { 
              backgroundColor: colors.card,
              borderColor: errors[field] ? '#F44336' : colors.tabIconDefault + '40',
              color: colors.text
            }
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.tabIconDefault}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !passwordVisible}
          autoCapitalize={secureTextEntry ? 'none' : field === 'email' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {showPasswordToggle && (
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={onTogglePassword}
          >
            <Ionicons 
              name={passwordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={colors.tabIconDefault}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Complete Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.tint }]}>
              <Ionicons name="person-add" size={32} color="white" />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>loqey</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
              Let's complete your profile
            </Text>
          </View>

          {/* Email Display */}
          <View style={[styles.emailBadge, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
            <Text style={[styles.emailBadgeText, { color: colors.tint }]}>
              {email}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {renderInput(
              'Password', 
              'password', 
              'Create a password', 
              'default', 
              true, 
              true, 
              showPassword,
              () => setShowPassword(!showPassword)
            )}
            {renderInput(
              'Confirm Password', 
              'confirmPassword', 
              'Confirm your password', 
              'default', 
              true, 
              true, 
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}
            {renderInput('First Name', 'firstName', 'Enter your first name')}
            {renderInput('Last Name', 'lastName', 'Enter your last name')}
            {renderInput('Phone Number (Optional)', 'phoneNumber', '(555) 123-4567', 'phone-pad')}
            {renderInput('State', 'state', 'Enter your state')}
            {renderInput('ZIP Code', 'zipCode', 'Enter your ZIP code', 'numeric')}
          </View>

          {/* Complete Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Creating Account..." : "Complete Registration"}
              onPress={handleComplete}
              variant="primary"
              size="large"
              style={styles.completeButton}
              disabled={isLoading}
            />
          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  emailBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  completeButton: {
    width: '100%',
  },
});

