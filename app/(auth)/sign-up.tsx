import * as React from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, Image } from 'react-native';
import { useSignUp, useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronRight, Star, Apple, Home, Tag, Briefcase } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ObsidianLogo, ObsidianAppIcon } from '@/components/ObsidianLogo';

type Step = 'splash' | 'survey' | 'form';

type Role = 'buyer' | 'seller' | 'broker';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setActiveFromSignIn } = useSignIn();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const appleOAuth = useOAuth({ strategy: 'oauth_apple' });
  const router = useRouter();

  const [step, setStep] = React.useState<Step>('splash');
  const params = useLocalSearchParams<{ email?: string }>();
  const [emailAddress, setEmailAddress] = React.useState<string>(typeof params.email === 'string' ? params.email : '');
  const [password, setPassword] = React.useState<string>('');
  const [role, setRole] = React.useState<Role>('buyer');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const mountedRef = React.useRef<boolean>(false);

  // Check for pending role from onboarding
  React.useEffect(() => {
    const checkPendingRole = async () => {
      try {
        const pendingRole = await AsyncStorage.getItem('pendingRole');
        if (pendingRole && ['buyer', 'seller', 'broker'].includes(pendingRole)) {
          setRole(pendingRole as Role);
          // If we have a pending role, skip splash and go to survey
          setStep('survey');
        }
      } catch (e) {
        console.log('[SignUp] checkPendingRole error', e);
      }
    };
    checkPendingRole();
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const proceed = React.useCallback((next: Step) => setStep(next), []);

  const onSignUpPress = async () => {
    if (!isLoaded || !mountedRef.current) return;
    setIsLoading(true);
    try {
      // Store the selected role before creating account
      await AsyncStorage.setItem('pendingRole', role);
      
      const created = await signUp.create({ emailAddress, password });

      if (created.status === 'complete' && created.createdSessionId) {
        await setActive({ session: created.createdSessionId });
        if (mountedRef.current) router.replace('/');
        return;
      }

      if (isSignInLoaded) {
        const attempt = await signIn.create({ identifier: emailAddress, password });
        if (attempt.status === 'complete' && attempt.createdSessionId) {
          await setActiveFromSignIn({ session: attempt.createdSessionId });
          if (mountedRef.current) router.replace('/');
          return;
        }
      }

      Alert.alert('Almost there', 'Account created. Please sign in with your credentials.');
      if (mountedRef.current) router.replace('/(auth)/sign-in');
    } catch (err: unknown) {
      let logMessage = 'Sign up failed';
      let uiMessage = 'Failed to create account';
      try {
        if (err instanceof Error) {
          logMessage = err.message;
          uiMessage = err.message || uiMessage;
        } else if (typeof err === 'object') {
          logMessage = JSON.stringify(err);
        } else {
          logMessage = String(err);
        }
      } catch {}
      console.log('Sign up error:', logMessage);
      const asAny = err as any;
      if (typeof logMessage === 'string' && (logMessage.includes('Rate exceeded') || logMessage.includes('not valid JSON'))) {
        Alert.alert('Please wait', 'Too many requests right now. Try again in a minute.');
        return;
      }
      if (asAny?.errors && Array.isArray(asAny.errors) && asAny.errors[0]?.message) {
        uiMessage = asAny.errors[0].message as string;
      }
      Alert.alert('Sign Up Error', uiMessage);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step !== 'splash' && (
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step === 'survey' ? 'splash' : 'survey')}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
      )}

      {step === 'splash' && (
        <View style={styles.centerWrap} testID="signup-splash">
          <ObsidianAppIcon size={96} testID="signup-splash-appicon" />
          <Text style={styles.appTitle}>Obsidian Auctions</Text>
          <Text style={styles.appTag}>Exclusive auctions. Real opportunities.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => proceed('survey')} testID="signup-get-started">
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.btnGradient}>
              <Text style={styles.btnText}>Get started</Text>
              <ChevronRight color="#FFF" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {step === 'survey' && (
        <View style={styles.form} testID="signup-survey">
          <Text style={styles.title}>Tell us about you</Text>
          <Text style={styles.subtitle}>We personalize your experience based on your role</Text>

          <View style={styles.choicesGrid}>
            <ChoiceCard
              icon={<Home color="#FFF" size={24} />}
              label="Buying"
              description="Looking to acquire"
              selected={role === 'buyer'}
              onPress={() => setRole('buyer')}
              testID="survey-buyer"
              accentColor="#10B981"
            />
            <ChoiceCard
              icon={<Tag color="#FFF" size={24} />}
              label="Selling"
              description="Ready to list"
              selected={role === 'seller'}
              onPress={() => setRole('seller')}
              testID="survey-seller"
              accentColor="#F59E0B"
            />
            <ChoiceCard
              icon={<Briefcase color="#FFF" size={24} />}
              label="Broker"
              description="Representing clients"
              selected={role === 'broker'}
              onPress={() => setRole('broker')}
              testID="survey-broker"
              accentColor="#6366F1"
            />
          </View>

          <View style={styles.bullets}>
            <Bullet text="Curated listings for your goals" />
            <Bullet text="Smart alerts and bidding" />
            <Bullet text="Secure transactions" />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={() => proceed('form')} testID="survey-continue">
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.btnGradient}>
              <Text style={styles.btnText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {step === 'form' && (
        <View style={styles.form} testID="signup-form">
          <View style={styles.brandHeader}>
            <ObsidianLogo size={48} variant="color" testID="signup-brand-logo" />
            <Text style={styles.brandTitle}>Obsidian Auctions</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join as a {role}</Text>

          <View style={styles.oauthRow}>
            <SocialButton
              label="Continue with Apple"
              onPress={async () => {
                try {
                  await AsyncStorage.setItem('pendingRole', role);
                  const res = await appleOAuth.startOAuthFlow();
                  if (res?.createdSessionId) {
                    await res.setActive?.({ session: res.createdSessionId });
                    router.replace('/');
                  }
                } catch (e) {
                  Alert.alert('Apple Sign Up Failed', 'Please try again or use email.');
                }
              }}
              variant="apple"
              testID="signup-apple"
            />
            <SocialButton
              label="Continue with Google"
              onPress={async () => {
                try {
                  await AsyncStorage.setItem('pendingRole', role);
                  const res = await googleOAuth.startOAuthFlow();
                  if (res?.createdSessionId) {
                    await res.setActive?.({ session: res.createdSessionId });
                    router.replace('/');
                  }
                } catch (e) {
                  Alert.alert('Google Sign Up Failed', 'Please try again or use email.');
                }
              }}
              variant="google"
              testID="signup-google"
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
            testID="signup-email"
          />

          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#6B7280"
            secureTextEntry
            onChangeText={setPassword}
            autoComplete="password-new"
            testID="signup-password"
          />

          <TouchableOpacity
            style={[styles.submitBtn, (!emailAddress || !password || isLoading) && styles.disabled]}
            onPress={onSignUpPress}
            disabled={!emailAddress || !password || isLoading}
            testID="signup-create-btn"
          >
            <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.btnGradient}>
              <Text style={styles.btnText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" style={styles.link}>
              <Text style={styles.linkHighlight}>Sign in</Text>
            </Link>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function ChoiceCard({ icon, label, description, selected, onPress, testID, accentColor }: { icon: React.ReactNode; label: string; description: string; selected: boolean; onPress: () => void; testID?: string; accentColor: string }) {
  const IconComponent = () => <>{icon}</>;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.choice, selected && { ...styles.choiceSelected, borderColor: accentColor }]} testID={testID}>
      <LinearGradient
        colors={selected ? [accentColor + '20', accentColor + '10'] : ['#1F1F2E', '#1F1F2E']}
        style={styles.choiceGradient}
      >
        <View style={[styles.choiceIconBg, { backgroundColor: accentColor + '30' }]}>
          <IconComponent />
        </View>
        <Text style={styles.choiceLabel}>{label}</Text>
        <Text style={styles.choiceDescription}>{description}</Text>
        {selected && (
          <View style={[styles.selectedBadge, { backgroundColor: accentColor }]}>
            <Star color="#FFF" size={12} fill="#FFF" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
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

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B', padding: 24 },
  backBtn: { position: 'absolute' as const, top: 60, left: 24, zIndex: 10, padding: 8 },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 96, height: 96, borderRadius: 24 },
  logoSmall: { width: 48, height: 48, borderRadius: 12 },
  brandHeader: { alignItems: 'center', gap: 8 as const, marginBottom: 8 },
  brandTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' as const },
  appTitle: { color: '#FFF', fontSize: 28, fontWeight: '700' as const, marginTop: 16 },
  appTag: { color: '#A1A1AA', fontSize: 14, marginTop: 6 },
  ctaBtn: { height: 52, borderRadius: 26, overflow: 'hidden', marginTop: 24, width: 240 },
  form: { flex: 1, justifyContent: 'center', maxWidth: 420, alignSelf: 'center', width: '100%', paddingVertical: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700' as const, marginBottom: 6, textAlign: 'center' as const },
  subtitle: { color: '#A1A1AA', fontSize: 13, marginBottom: 12, textAlign: 'center' as const },
  oauthRow: { gap: 10 as const, marginTop: 8, marginBottom: 12 },
  socialBtn: { height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 as const },
  appleBtn: { backgroundColor: '#000000', borderWidth: 1, borderColor: '#000000' },
  googleBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DADCE0' },
  socialText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' as const },
  socialIcon: { width: 18, height: 18, borderRadius: 0 },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 as const, marginVertical: 8 },
  divider: { flex: 1, height: 1, backgroundColor: '#27272A' },
  dividerText: { color: '#71717A', fontSize: 12 },
  input: { height: 52, backgroundColor: '#1F1F2E', borderRadius: 14, paddingHorizontal: 16, color: '#FFF', borderWidth: 1, borderColor: '#2A2A3E', marginBottom: 16, fontSize: 16 },
  submitBtn: { height: 52, borderRadius: 26, overflow: 'hidden', marginTop: 8, marginBottom: 24 },
  disabled: { opacity: 0.5 },
  btnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 as const },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' as const },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  linkText: { color: '#A1A1AA', fontSize: 14 },
  link: { padding: 4 },
  linkHighlight: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' as const },
  choicesGrid: { gap: 10 as const, marginBottom: 16, marginTop: 4 },
  choice: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2A2A3E',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  choiceSelected: {
    borderWidth: 2,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  choiceGradient: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  choiceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  choiceLabel: { color: '#FFF', fontSize: 17, fontWeight: '700' as const, marginBottom: 4 },
  choiceDescription: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' as const },
  selectedBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bullets: { gap: 8 as const, marginVertical: 10, paddingHorizontal: 8 },
  bulletItem: { flexDirection: 'row', alignItems: 'center' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8B5CF6', marginRight: 8 },
  bulletText: { color: '#D1D5DB', fontSize: 13 },
});