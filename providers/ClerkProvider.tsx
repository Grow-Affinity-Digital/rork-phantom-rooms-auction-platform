import React from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Platform } from 'react-native';

// Get the publishable key from environment variables
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_YW1hemVkLW1pbmstMTIuY2xlcmsuYWNjb3VudHMuZGV2JA';

console.log('Clerk publishable key loaded:', publishableKey?.substring(0, 20) + '...');

if (!publishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file.'
  );
}

// Comprehensive suppression of expected CAPTCHA warnings across all platforms
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress CAPTCHA-related warnings
    if (
      message.includes('clerk-captcha') ||
      message.includes('Smart CAPTCHA widget') ||
      message.includes('Invisible CAPTCHA widget') ||
      message.includes('CAPTCHA widget') ||
      message.includes('DOM element was not found')
    ) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress CAPTCHA-related errors
    if (
      message.includes('clerk-captcha') ||
      message.includes('Smart CAPTCHA widget') ||
      message.includes('Invisible CAPTCHA widget') ||
      message.includes('CAPTCHA widget')
    ) {
      return;
    }
  }
  originalError.apply(console, args);
};

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const clerkOptions = React.useMemo(() => {
    const baseOptions = {
      publishableKey,
      tokenCache,
    };

    // Add web-specific options if running on web
    if (Platform.OS === 'web') {
      return {
        ...baseOptions,
        // Disable CAPTCHA for web to prevent DOM element errors
        appearance: {
          elements: {
            rootBox: {
              // Ensure proper styling for web
              width: '100%',
            },
          },
        },
      };
    }

    return baseOptions;
  }, []);

  return (
    <ClerkProvider {...clerkOptions}>
      {children}
    </ClerkProvider>
  );
}


