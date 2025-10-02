import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function UnlockScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { unlockDeviceWithLink, isLoading } = useAppStore();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!code) {
      Alert.alert('Error', 'No access code provided', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [code, router]);

  const handleUnlock = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!code) {
      setError('Invalid access code');
      return;
    }

    try {
      const success = await unlockDeviceWithLink(code, password);
      
      if (success) {
        Alert.alert(
          'Success!', 
          'Device unlocked successfully',
          [
            { text: 'OK', onPress: () => router.replace('/') }
          ]
        );
      } else {
        setError('Invalid password or expired link');
      }
    } catch (error) {
      console.error('Unlock error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) {
      setError('');
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Unlock Device</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Lock Icon */}
          <View style={styles.iconSection}>
            <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
              <Ionicons name="lock-open-outline" size={48} color="white" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Device Access
            </Text>
            <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
              Enter the password to unlock this device
            </Text>
          </View>

          {/* Access Code Display */}
          {code && (
            <View style={[styles.codeContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.codeLabel, { color: colors.tabIconDefault }]}>
                Access Code:
              </Text>
              <Text style={[styles.codeText, { color: colors.text }]}>
                {code}
              </Text>
            </View>
          )}

          {/* Password Input */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  { 
                    backgroundColor: colors.card,
                    borderColor: error ? '#F44336' : colors.tabIconDefault + '40',
                    color: colors.text
                  }
                ]}
                placeholder="Enter unlock password"
                placeholderTextColor={colors.tabIconDefault}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Unlock Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={isLoading ? "Unlocking..." : "Unlock Device"}
              onPress={handleUnlock}
              variant="primary"
              size="large"
              style={styles.unlockButton}
              disabled={isLoading || !password.trim()}
            />
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
              Make sure you have the correct password for this access link.
              If you don't have the password, contact the device owner.
            </Text>
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
  iconSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconContainer: {
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
  codeContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
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
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  unlockButton: {
    width: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
