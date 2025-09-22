import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Apple } from 'lucide-react-native';
import { PhantomRoomsLogo } from '@/components/PhantomRoomsLogo';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const appleOAuth = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const mountedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onSignInPress = async () => {
    if (!isLoaded || !mountedRef.current) return;

    setIsLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (!mountedRef.current) return;

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        if (mountedRef.current) {
          router.replace('/');
        }
      } else {
        console.error('Sign in incomplete - status:', signInAttempt.status);
        if (mountedRef.current) {
          Alert.alert('Sign In Error', 'Please check your credentials and try again.');
        }
      }
    } catch (err: unknown) {
      let logMessage = 'Sign in failed';
      try {
        if (err instanceof Error) {
          logMessage = err.message;
        } else if (typeof err === 'object') {
          logMessage = JSON.stringify(err);
        } else {
          logMessage = String(err);
        }
      } catch {}
      console.error('Sign in error:', logMessage);

      if (!mountedRef.current) return;
      let errorMessage = 'Failed to sign in';
      let errorCode: string | null = null;
      const asAny = err as any;

      if (typeof logMessage === 'string' && (logMessage.includes('Rate exceeded') || logMessage.includes('not valid JSON'))) {
        Alert.alert('Please wait', 'We are receiving too many requests. Try again in a minute.');
        return;
      }

      if (asAny && typeof asAny === 'object') {
        if (asAny.errors && Array.isArray(asAny.errors) && asAny.errors.length > 0) {
          errorCode = asAny.errors[0].code as string;
          errorMessage = (asAny.errors[0].message || asAny.errors[0].longMessage || errorMessage) as string;
        } else if (asAny.message) {
          errorMessage = asAny.message as string;
        } else if (asAny.status) {
          errorMessage = `Sign in failed with status: ${asAny.status}`;
        } else if (asAny.serializedErrors && Array.isArray(asAny.serializedErrors) && asAny.serializedErrors.length > 0) {
          errorCode = asAny.serializedErrors[0].code as string;
          errorMessage = (asAny.serializedErrors[0].message || asAny.serializedErrors[0].longMessage || errorMessage) as string;
        }
      }

      if (errorCode === 'form_identifier_not_found') {
        Alert.alert(
          'Account Not Found',
          'No account found with this email. You may need to complete your sign-up process or create a new account.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Complete Sign Up',
              onPress: () => router.replace('/(auth)/sign-up')
            }
          ]
        );
      } else if (errorCode === 'form_password_incorrect') {
        Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
      } else if (errorCode === 'too_many_requests') {
        Alert.alert('Too Many Attempts', 'Too many sign-in attempts. Please try again later.');
      } else {
        Alert.alert('Sign In Error', errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <ArrowLeft color="#FFF" size={24} />
      </TouchableOpacity>
      
      <View style={styles.form}>
        <View style={styles.brandHeader}>
          <PhantomRoomsLogo size={48} />
          <Text style={styles.brandTitle}>Phantom Rooms</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.oauthRow}>
          <SocialButton
            label="Continue with Apple"
            onPress={async () => {
              try {
                const res = await appleOAuth.startOAuthFlow();
                if (res?.createdSessionId) {
                  await res.setActive?.({ session: res.createdSessionId });
                  router.replace('/');
                }
              } catch (e) {
                Alert.alert('Apple Sign In Failed', 'Please try again or use email.');
              }
            }}
            variant="apple"
            testID="signin-apple"
          />
          <SocialButton
            label="Continue with Google"
            onPress={async () => {
              try {
                const res = await googleOAuth.startOAuthFlow();
                if (res?.createdSessionId) {
                  await res.setActive?.({ session: res.createdSessionId });
                  router.replace('/');
                }
              } catch (e) {
                Alert.alert('Google Sign In Failed', 'Please try again or use email.');
              }
            }}
            variant="google"
            testID="signin-google"
          />
        </View>

        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>
        
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#6B7280"
          onChangeText={setEmailAddress}
          keyboardType="email-address"
          autoComplete="email"
        />
        
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#6B7280"
          secureTextEntry={true}
          onChangeText={setPassword}
          autoComplete="password"
        />
        
        <TouchableOpacity 
          style={[styles.submitBtn, (!emailAddress || !password || isLoading) && styles.disabled]}
          onPress={onSignInPress}
          disabled={!emailAddress || !password || isLoading}
        >
          <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.btnGradient}>
            <Text style={styles.btnText} testID="signin-submit-text">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Dont have an account? </Text>
          <Link href="/(auth)/sign-up" style={styles.link}>
            <Text style={styles.linkHighlight}>Sign up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SocialButton({ label, onPress, variant, testID }: { label: string; onPress: () => void | Promise<void>; variant: 'apple' | 'google'; testID?: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.socialBtn, variant === 'apple' ? styles.appleBtn : styles.googleBtn]} testID={testID}>
      {variant === 'apple' ? (
        <Apple color="#FFF" size={18} />
      ) : (
        <Image source={{ uri: 'https://static-00.iconduck.com/assets.00/google-icon-512x512-2g7v7z5b.png' }} style={styles.socialIcon} />
      )}
      <Text style={[styles.socialText, variant === 'google' ? { color: '#3C4043' } : { color: '#FFFFFF' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  brandHeader: { alignItems: 'center', gap: 8 as const, marginBottom: 8 },
  logoSmall: { width: 48, height: 48, borderRadius: 12 },
  brandTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' as const },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  oauthRow: { gap: 10 as const, marginTop: 8, marginBottom: 12 },
  socialBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 as const },
  appleBtn: { backgroundColor: '#000000', borderWidth: 1, borderColor: '#000000' },
  googleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DADCE0' },
  socialText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' as const },
  socialIcon: { width: 18, height: 18, borderRadius: 0 },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 as const, marginVertical: 8 },
  divider: { flex: 1, height: 1, backgroundColor: '#27272A' },
  dividerText: { color: '#71717A', fontSize: 12 },
  input: {
    height: 52,
    backgroundColor: '#1F1F2E',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2A2A3E',
    marginBottom: 16,
    fontSize: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  disabled: {
    opacity: 0.5,
  },
  btnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  link: {
    padding: 4,
  },
  linkHighlight: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});