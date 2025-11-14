import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <Ionicons 
          name="alert-circle-outline" 
          size={64} 
          color={colors.tabIconDefault} 
          style={styles.icon}
        />
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <ThemedText type="default" style={styles.description}>
          The screen you&apos;re looking for could not be found.
        </ThemedText>
        
        <TouchableOpacity 
          style={[styles.homeButton, { backgroundColor: colors.tint }]}
          onPress={handleGoHome}
        >
          <Ionicons name="home-outline" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Go to Home</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  description: {
    marginTop: 15,
    paddingVertical: 15,
    textAlign: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
