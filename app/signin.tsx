import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store';
import { AuthAPI } from '@/api/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignInScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await AuthAPI.loginWithStatus(formData.email, formData.password);
        
        if (response.success && response.data) {
          const { status, message, access_token, refresh_token, user, email } = response.data;

          if (status === 'not_registered') {
            // User not found - show message and redirect to signup
            Alert.alert(
              'Account Not Found',
              message,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Sign Up', 
                  onPress: () => router.push('/signup' as any)
                }
              ]
            );
          } else if (status === 'incomplete_profile') {
            // Profile incomplete - redirect to complete profile
            Alert.alert(
              'Complete Your Profile',
              message,
              [
                {
                  text: 'Continue',
                  onPress: () => router.push({
                    pathname: '/complete-profile',
                    params: { email: email || formData.email }
                  } as any)
                }
              ]
            );
          } else if (status === 'success' && access_token && user) {
            // Success - store tokens and navigate
            if (refresh_token) {
              await AsyncStorage.setItem('refresh_token', refresh_token);
            }

            // Update store
            useAppStore.setState({
              authToken: access_token,
              user: user as any,
              isAuthenticated: true,
            });

            // Load initial data
            const { loadDevices, loadLinks } = useAppStore.getState();
            Promise.all([
              loadDevices().catch(err => console.warn('Device load failed:', err)),
              loadLinks().catch(err => console.warn('Links load failed:', err)),
            ]);

            router.replace('/');
          }
        } else {
          setLoginError(response.error || 'Invalid email or password. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Company Section */}
          <View style={styles.logoSection}>
            {/* Logo Placeholder */}
            <View style={[styles.logoContainer, { backgroundColor: colors.tint }]}>
              <Ionicons name="lock-closed" size={48} color="white" />
            </View>
            
            {/* Company Name */}
            <Text style={[styles.companyName, { color: colors.text }]}>loqey</Text>
            <Text style={[styles.tagline, { color: colors.tabIconDefault }]}>
              Secure. Smart. Simple.
            </Text>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.tabIconDefault }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.card,
                    borderColor: errors.email ? '#F44336' : colors.tabIconDefault + '40',
                    color: colors.text
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.tabIconDefault}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    { 
                      backgroundColor: colors.card,
                      borderColor: errors.password ? '#F44336' : colors.tabIconDefault + '40',
                      color: colors.text
                    }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.tabIconDefault}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.tabIconDefault}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPassword, { color: colors.tint }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Error */}
          {loginError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          ) : null}

          {/* Sign In Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              variant="primary"
              size="large"
              style={styles.signInButton}
              disabled={isLoading}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: colors.tabIconDefault }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/signup' as any)}>
              <Text style={[styles.signUpLink, { color: colors.tint }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  companyName: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
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
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  signInButton: {
    width: '100%',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  signUpText: {
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  loginErrorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
  },
});
