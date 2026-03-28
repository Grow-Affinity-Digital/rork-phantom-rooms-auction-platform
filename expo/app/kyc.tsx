import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function KYCScreen() {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(() => fullName.trim().length >= 2 && idNumber.trim().length >= 6, [fullName, idNumber]);

  const submit = useCallback(async () => {
    const name = fullName.trim();
    const id = idNumber.trim();
    if (!name || !id) return;
    setIsSubmitting(true);
    console.log('[KYC] submit', { name, id });
    setTimeout(() => {
      setStatus('pending');
      setIsSubmitting(false);
    }, 800);
  }, [fullName, idNumber]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="kyc-screen">
      <Stack.Screen options={{ title: 'KYC Verification' }} />
      <View style={[styles.badge, { backgroundColor: status === 'verified' ? '#10B981' : status === 'pending' ? '#F59E0B' : colors.border }]}>        
        <Text style={[styles.badgeText]}>{status.toUpperCase()}</Text>
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="As it appears on ID"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>ID Number</Text>
        <TextInput
          value={idNumber}
          onChangeText={setIdNumber}
          placeholder="Government ID"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
      </View>
      <TouchableOpacity
        onPress={submit}
        disabled={!canSubmit || isSubmitting}
        style={[styles.button, { backgroundColor: canSubmit && !isSubmitting ? colors.primary : colors.border }]}
        testID="kyc-submit"
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.select({ web: 10, default: 12 }) as number },
  button: { marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '600' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12 },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
});