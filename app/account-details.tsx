import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState<string>(user?.name ?? '');
  const [email] = useState<string>(user?.email ?? '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const canSave = useMemo(() => name.trim().length > 1 && name.trim().length <= 64, [name]);

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 64) {
      Alert.alert('Invalid name', 'Please enter a valid name between 2 and 64 characters.');
      return;
    }
    try {
      setIsSaving(true);
      console.log('[Account] Saving profile name', trimmed);
      const storageKey = 'appUser';
      const raw = await import('@react-native-async-storage/async-storage');
      const AsyncStorage = (raw as any).default;
      const currentRaw = await AsyncStorage.getItem(storageKey);
      if (!currentRaw) {
        Alert.alert('Not signed in', 'Please sign in again.');
        router.replace('/(auth)/sign-in');
        return;
      }
      const parsed = JSON.parse(currentRaw) as { name?: string } & Record<string, unknown>;
      const next = { ...parsed, name: trimmed };
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      Alert.alert('Saved', 'Your name was updated.');
      router.back();
    } catch (e) {
      console.log('[Account] Save error', e);
      Alert.alert('Save failed', 'Please try again later.');
    } finally {
      setIsSaving(false);
    }
  }, [name, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="account-details-screen">
      <Stack.Screen options={{ title: 'Account Details' }} />
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        <TextInput
          testID="input-name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <View style={[styles.readonly, { borderColor: colors.border, backgroundColor: colors.surface }]} testID="readonly-email">
          <Text style={{ color: colors.text }}>{email || '—'}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleSave}
        disabled={!canSave || isSaving}
        style={[styles.button, { backgroundColor: canSave && !isSaving ? colors.primary : colors.border }]}
        testID="save-account"
      >
        <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.select({ web: 10, default: 12 }) as number },
  readonly: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  button: { marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '600' },
});