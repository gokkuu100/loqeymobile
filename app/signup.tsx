import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
    View,
} from 'react-native';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const handleSendVerification = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthAPI.sendVerificationCode(email);

      if (response.success) {
        // Navigate directly to verify email screen
        router.replace({
          pathname: '/verify-email',
          params: { email }
        } as any);
      } else {
        Alert.alert('Error', response.error || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Send verification error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sign Up</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoPlaceholder, { backgroundColor: colors.tint }]}>
              <Ionicons name="mail" size={32} color="white" />
            </View>
            <Text style={[styles.logoText, { color: colors.text }]}>loqey</Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
              Start by verifying your email
            </Text>
          </View>

          {/* Description */}
          <View style={styles.description}>
            <Text style={[styles.descriptionText, { color: colors.tabIconDefault }]}>
              We'll send a verification code to your email to ensure it's really you.
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.card,
                    borderColor: error ? '#F44336' : colors.tabIconDefault + '40',
                    color: colors.text
                  }
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.tabIconDefault}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Sending..." : "Continue"}
              onPress={handleSendVerification}
              variant="primary"
              size="large"
              style={styles.signUpButton}
              disabled={isLoading}
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: colors.tabIconDefault }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/signin' as any)}>
              <Text style={[styles.signInLink, { color: colors.tint }]}>
                Sign In
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
    marginBottom: 40,
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
  description: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  signUpButton: {
    width: '100%',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  signInText: {
    fontSize: 16,
  },
  signInLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
