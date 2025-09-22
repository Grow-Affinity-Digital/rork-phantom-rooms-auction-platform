import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const { user, setSubscribed } = useAuth();
  const isActive = !!user?.isSubscribed;
  const [plan, setPlan] = useState<'basic' | 'premium' | 'pro'>('premium');

  const priceText = useMemo(() => {
    switch (plan) {
      case 'basic':
        return isActive ? 'Basic plan active' : '$0/month';
      case 'premium':
        return isActive ? 'Premium active' : '$19.98/month';
      case 'pro':
        return isActive ? 'Pro plan active' : '$39.98/month';
      default:
        return '$19.98/month';
    }
  }, [isActive, plan]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="subscription-screen">
      <Stack.Screen options={{ title: 'Subscription & Billing' }} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>        
        <Text style={[styles.title, { color: colors.text }]}>Choose your plan</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Upgrade anytime. Cancel in settings.</Text>

        <View style={styles.planRow}>
          {([
            { key: 'basic', title: 'Basic', price: '$0', perks: 'Browse & save' },
            { key: 'premium', title: 'Premium', price: '$19.98', perks: 'Priority placement' },
            { key: 'pro', title: 'Pro', price: '$39.98', perks: 'Pro insights' },
          ] as const).map((p) => {
            const k = p.key;
            const active = plan === k;
            return (
              <Pressable
                key={k}
                onPress={() => setPlan(k)}
                testID={`plan-${k}`}
                style={({ pressed }) => [
                  styles.plan,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? (pressed ? colors.primary : colors.surface) : colors.surface,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.planTitle, { color: colors.text }]}>{p.title}</Text>
                <Text style={[styles.planPrice, { color: colors.primary }]}>{p.price}/mo</Text>
                <Text style={[styles.planPerk, { color: colors.textSecondary }]}>{p.perks}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryText, { color: colors.text }]}>{priceText}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setSubscribed(!isActive)}
          style={[styles.button, { backgroundColor: isActive ? colors.border : colors.primary }]}
          testID="toggle-subscription"
        >
          <Text style={styles.buttonText}>{isActive ? 'Cancel Subscription' : `Start ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  subtitle: { fontSize: 12, marginBottom: 12 },
  planRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  plan: { flex: 1, borderWidth: 2, borderRadius: 14, padding: 12 },
  planTitle: { fontSize: 14, fontWeight: '700' },
  planPrice: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  planPerk: { fontSize: 12, marginTop: 2 },
  summary: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  summaryText: { fontSize: 14, fontWeight: '600' },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '600' },
});