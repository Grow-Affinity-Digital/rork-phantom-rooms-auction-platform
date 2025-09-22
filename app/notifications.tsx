import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useStorage } from '@/providers/StorageProvider';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { getItem, setItem } = useStorage();
  const [push, setPush] = useState<boolean>(true);
  const [email, setEmail] = useState<boolean>(true);
  const [sms, setSms] = useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      const raw = await getItem('notif');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { push?: boolean; email?: boolean; sms?: boolean };
          setPush(parsed.push ?? true);
          setEmail(parsed.email ?? true);
          setSms(parsed.sms ?? false);
        } catch (e) {
          console.log('[Notif] parse error', e);
        }
      }
    })();
  }, [getItem]);

  React.useEffect(() => {
    const payload = JSON.stringify({ push, email, sms });
    setItem('notif', payload).catch((e) => console.log('[Notif] save error', e));
  }, [push, email, sms, setItem]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="notification-settings-screen">
      <Stack.Screen options={{ title: 'Notifications' }} />
      <Row label="Push Notifications" value={push} onChange={setPush} />
      <Row label="Email Updates" value={email} onChange={setEmail} />
      <Row label="SMS Alerts" value={sms} onChange={setSms} />
      <Text style={[styles.note, { color: colors.textSecondary }]}>You can fine-tune these later per listing.</Text>
    </View>
  );
}

interface RowProps { label: string; value: boolean; onChange: (v: boolean) => void }

const Row = React.memo(function Row({ label, value, onChange }: RowProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} thumbColor={value ? colors.primary : '#fff'} trackColor={{ true: colors.primary, false: colors.border }} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  note: { marginTop: 16, fontSize: 12 },
});