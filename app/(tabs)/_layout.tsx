import { Tabs, router } from "expo-router";
import React, { useCallback } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { ObsidianLogo } from "@/components/ObsidianLogo";
import { ExploreIcon, SellingIcon, BuyingIcon, AlertsIcon, ProfileIcon } from "@/components/IconSet";

export default function TabLayout() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const handleTabPress = useCallback((e: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const routeName: string | null = e?.target?.split('-')?.[0] ?? null;
    const gate = (name: string | null) => name === 'selling' || name === 'buying';
    if (gate(routeName) && !user?.isSubscribed) {
      e?.preventDefault?.();
      const source = routeName === 'selling' ? 'tab-selling' : 'tab-buying';
      router.push({ pathname: '/paywall', params: { source } });
    }
  }, [user?.isSubscribed]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
          lineHeight: 14,
        },
        tabBarItemStyle: {
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => <ExploreIcon color={color} size={24} />,
          headerTitle: () => <ObsidianLogo size={28} variant="dark" testID="header-logo" />,
        }}
      />
      <Tabs.Screen
        name="selling"
        options={{
          title: "Selling",
          tabBarIcon: ({ color }) => <SellingIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="buying"
        options={{
          title: "Buying",
          tabBarIcon: ({ color }) => <BuyingIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => <AlertsIcon color={color} size={24} />,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <ProfileIcon color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}