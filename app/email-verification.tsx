import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react-native';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';

export default function EmailVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const { signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  
  const email = signUp?.emailAddress || 'your email';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if user is already signed in when component mounts
  useEffect(() => {
    if (isSignedIn) {
      console.log('User is already signed in on mount, redirecting to main app');
      router.replace('/(tabs)/explore');
    }
  }, [isSignedIn]);

  const handleVerifyCode = async () => {
    if (!signUp || verificationCode.length !== 6) {
      return;
    }

    // Check if user is already signed in
    if (isSignedIn) {
      console.log('User is already signed in, redirecting to main app');
      router.replace('/(tabs)/explore');
      return;
    }

    setIsVerifying(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        // Handle incomplete verification
        console.error('Verification incomplete - status:', result.status);
        
        // Safely log the full result object
        try {
          console.error('Full result object:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.error('Full result object (non-serializable):', result);
        }
        
        if (result.status === 'missing_requirements') {
          // Try to get missing requirements from the object
          const resultObj = result as any;
          
          // Log all available properties for debugging
          console.log('Available properties on result:', Object.keys(resultObj));
          
          const missingReqs = resultObj.missingRequirements || resultObj.missing_requirements || [];
          const unverifiedFields = resultObj.unverifiedFields || resultObj.unverified_fields || [];
          const nextStep = resultObj.nextStep || resultObj.next_step;
          
          console.log('Missing requirements:', missingReqs);
          console.log('Unverified fields:', unverifiedFields);
          console.log('Next step:', nextStep);
          
          // Check if there's a session we can activate
          if (resultObj.createdSessionId || resultObj.created_session_id) {
            console.log('Found session ID, attempting to activate');
            try {
              const sessionId = resultObj.createdSessionId || resultObj.created_session_id;
              await setActive({ session: sessionId });
              router.replace('/');
              return;
            } catch (sessionErr) {
              console.error('Session activation failed:', sessionErr);
            }
          }
          
          // Check if email verification is actually complete but other steps are needed
          if (resultObj.verifications?.emailAddress?.status === 'verified' || 
              resultObj.verifications?.email_address?.status === 'verified') {
            console.log('Email is verified, but other requirements missing');
            
            // Try to proceed anyway since email is verified
            try {
              // Check if there's any session available
              if (signUp?.createdSessionId) {
                await setActive({ session: signUp.createdSessionId });
                router.replace('/');
                return;
              }
            } catch (sessionErr) {
              console.error('Session activation with signUp failed:', sessionErr);
            }
          }
          
          if (missingReqs.length > 0 || unverifiedFields.length > 0) {
            const allRequirements = [...missingReqs, ...unverifiedFields];
            const message = `Please complete the following: ${allRequirements.join(', ')}`;
            console.log('Missing requirements message:', message);
            if (Platform.OS === 'web') {
              console.error('Additional Information Required:', message);
            } else {
              Alert.alert('Additional Information Required', message);
            }
          } else {
            // No specific requirements found, but status is missing_requirements
            console.log('No specific missing requirements found, attempting generic completion');
            
            // Try to complete with any available session
            if (resultObj.createdSessionId || signUp?.createdSessionId) {
              try {
                const sessionId = resultObj.createdSessionId || signUp?.createdSessionId;
                await setActive({ session: sessionId });
                router.replace('/');
                return;
              } catch (sessionErr) {
                console.error('Generic session activation failed:', sessionErr);
              }
            }
            
            if (Platform.OS === 'web') {
              console.error('Verification incomplete - please try signing in instead');
            } else {
              Alert.alert(
                'Verification Incomplete', 
                'Your email may already be verified. Please try signing in instead.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign In', onPress: () => router.replace('/(auth)/sign-in') }
                ]
              );
            }
          }
        } else {
          if (Platform.OS === 'web') {
            console.error('Verification failed - please check your code');
          } else {
            Alert.alert('Verification Error', 'Please check your verification code and try again.');
          }
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err?.errors?.[0] || err?.message || 'Verification failed');
      
      let errorMessage = 'Verification failed';
      let errorCode = null;

      if (err && typeof err === 'object') {
        if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
          errorCode = err.errors[0].code;
          errorMessage = err.errors[0].message || err.errors[0].longMessage || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      // Handle specific error cases
      if (errorCode === 'verification_already_verified') {
        // Email is already verified, try to proceed with existing session
        console.log('Email already verified, attempting to activate session');
        try {
          // First try with the signUp session
          if (signUp?.createdSessionId) {
            console.log('Found signUp session, activating:', signUp.createdSessionId);
            await setActive({ session: signUp.createdSessionId });
            router.replace('/');
            return;
          }
          
          // If no session in signUp, check if there's an active session already
          console.log('No signUp session found, checking for existing active session');
          // The user might already be signed in, redirect to app root
          router.replace('/');
          return;
        } catch (sessionErr) {
          console.error('Session activation error:', sessionErr);
          // If session activation fails, the user needs to sign in
          if (Platform.OS === 'web') {
            console.error('Session activation failed - redirecting to sign in');
          } else {
            Alert.alert('Session Error', 'Please sign in to continue.');
          }
          router.replace('/(auth)/sign-in');
          return;
        }
      }
      
      if (Platform.OS === 'web') {
        console.error('Verification error:', errorMessage);
      } else {
        Alert.alert('Verification Error', errorMessage);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !signUp) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setCanResend(false);
      setCountdown(60);
    } catch (err: any) {
      console.error('Resend error:', err?.errors?.[0] || err?.message || 'Failed to resend code');
      
      const message = err?.errors?.[0]?.message || err?.message || 'Failed to resend code';
      if (Platform.OS === 'web') {
        console.error('Resend error:', message);
      } else {
        Alert.alert('Resend Error', message);
      }
    }
  };

  const handleSkipForDemo = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // For demo purposes, navigate to onboarding
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={['#0A0A0B', '#1A1A2E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.iconGradient}
            >
              <Mail color="#FFF" size={32} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a verification code to {'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (verificationCode.length !== 6 || isVerifying) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            <LinearGradient
              colors={
                verificationCode.length === 6 && !isVerifying
                  ? ['#8B5CF6', '#6366F1']
                  : ['#2A2A3E', '#2A2A3E']
              }
              style={styles.buttonGradient}
            >
              {isVerifying ? (
                <RefreshCw color="#FFF" size={20} />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify Email</Text>
                  <ArrowRight color="#FFF" size={20} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={!canResend}
              style={styles.resendButton}
            >
              <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
                {canResend ? 'Resend' : `Resend in ${countdown}s`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo skip button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipForDemo}
          >
            <Text style={styles.skipText}>Skip for Demo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  email: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  codeContainer: {
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    height: 60,
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    color: '#FFF',
    borderWidth: 2,
    borderColor: '#2A2A3E',
    letterSpacing: 8,
    fontWeight: '600',
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    padding: 4,
  },
  resendLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#666',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
});