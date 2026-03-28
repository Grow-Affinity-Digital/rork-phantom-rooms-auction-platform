import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useAuth as useAppAuth } from '@/providers/AuthProvider';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexScreen() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user, isLoading } = useAppAuth();

  useEffect(() => {
    if (!isLoaded) return;
    console.log('[Index] Clerk loaded. isSignedIn:', isSignedIn);

    if (!isSignedIn) {
      router.replace('/onboarding');
      return;
    }

    if (isLoading) return;
    const role = user?.role ?? 'visitor';
    const subscribed = user?.isSubscribed ?? false;
    console.log('[Index] Post-auth role routing. role:', role, 'subscribed:', subscribed);

    if (role === 'seller') {
      if (!subscribed) {
        router.replace({ pathname: '/paywall', params: { source: 'listing-creation' } });
        return;
      }
      router.replace('/create-listing');
      return;
    }

    router.replace('/(tabs)/explore');
  }, [isLoaded, isSignedIn, isLoading, user?.role]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
  },
});