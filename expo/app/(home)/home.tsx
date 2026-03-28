import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignOutButton from '@/app/components/SignOutButton';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomePage() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <SignedIn>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Obsidian Auctions</Text>
          <Text style={styles.subtitle}>
            Hello {user?.emailAddresses[0].emailAddress}
          </Text>
          <Text style={styles.description}>
            You are successfully signed in with Clerk authentication.
          </Text>
          <SignOutButton />
        </View>
      </SignedIn>
      
      <SignedOut>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Obsidian Auctions</Text>
          <Text style={styles.subtitle}>
            Please sign in to continue
          </Text>
          
          <View style={styles.buttonContainer}>
            <Link href="/(auth)/sign-in" style={styles.linkButton}>
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Sign In</Text>
              </LinearGradient>
            </Link>
            
            <Link href="/(auth)/sign-up" style={styles.linkButton}>
              <View style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Sign Up</Text>
              </View>
            </Link>
          </View>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
  linkButton: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 26,
  },
  outlineButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});