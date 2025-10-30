import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthAPI } from '@/api/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
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

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  
  // Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (value: string, index: number) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const response = await AuthAPI.verifyEmail(email, verificationCode);

      if (response.success) {
        // Navigate directly to complete profile
        router.replace({
          pathname: '/complete-profile',
          params: { email }
        } as any);
      } else {
        setError(response.error || 'Invalid verification code');
        setCode(['', '', '', '', '', '']); // Clear code on error
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setCode(['', '', '', '', '', '']);
    
    try {
      const response = await AuthAPI.sendVerificationCode(email);
      
      if (response.success) {
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', response.error || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Verify Email</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title and Description */}
              <Text style={[styles.title, { color: colors.text }]}>
                Enter Verification Code
              </Text>
              <Text style={[styles.description, { color: colors.tabIconDefault }]}>
                We've sent a 6-digit code to:
              </Text>
              <Text style={[styles.email, { color: colors.text }]}>
                {email}
              </Text>

              {/* Code Input */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: colors.card,
                        borderColor: error ? '#F44336' : digit ? colors.tint : colors.tabIconDefault + '40',
                        color: colors.text,
                      }
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              {/* Error Message */}
              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {/* Verify Button */}
              <Button
                title={isLoading ? "Verifying..." : "Verify"}
                onPress={() => handleVerify()}
                variant="primary"
                size="large"
                style={styles.verifyButton}
                disabled={isLoading || code.some(d => !d)}
              />

              {/* Resend Code */}
              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.tabIconDefault }]}>
                  Didn't receive the code?{' '}
                </Text>
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={[styles.resendLink, { color: colors.tint }]}>
                    {resending ? 'Sending...' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  codeInput: {
    flex: 1,
    maxWidth: 50,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    marginBottom: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

