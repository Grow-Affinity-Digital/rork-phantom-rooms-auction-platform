import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { trpc, trpcClient } from "@/lib/trpc";
import { ClerkWrapper } from "@/providers/ClerkProvider";
import { StorageProvider } from "@/providers/StorageProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Loading…</Text></View>}>
      {children}
    </React.Suspense>
  );
}

function RootLayoutNav() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={{
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: colors.surface,
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontWeight: '600',
      },
      contentStyle: {
        backgroundColor: colors.background,
      }
    }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(home)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="email-verification" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listing/[id]" options={{
        presentation: "card",
        headerShown: true,
        title: "Listing Details"
      }} />
      <Stack.Screen name="deposit-modal" options={{
        presentation: "modal",
        headerShown: false
      }} />
      <Stack.Screen name="bid-modal" options={{
        presentation: "modal",
        headerShown: false
      }} />
      <Stack.Screen name="paywall" options={{
        presentation: "modal",
        headerShown: false
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.log('[Splash] preventAutoHideAsync error', e);
      }
      if (!isMounted) return;
      timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((err) => console.log('[Splash] hideAsync error', err));
      }, 2000);
    })();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.root}>
          <ClerkWrapper>
            <StorageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <ErrorBoundary>
                    <RootLayoutNav />
                  </ErrorBoundary>
                </AuthProvider>
              </ThemeProvider>
            </StorageProvider>
          </ClerkWrapper>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
