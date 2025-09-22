import { Tabs, router } from "expo-router";
import React, { useCallback } from "react";
import { Platform } from "react-native";
import { Search, Package, ShoppingBag, Bell, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";

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
          height: 66,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 2,
          lineHeight: 13,
        },
        tabBarItemStyle: {
          paddingBottom: 6,
          paddingTop: 2,
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
          tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          headerTitle: "Phantom Rooms™",
        }}
      />
      <Tabs.Screen
        name="selling"
        options={{
          title: "Selling",
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="buying"
        options={{
          title: "Buying",
          tabBarIcon: ({ color }) => <ShoppingBag color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => <Bell color={color} size={24} />,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}