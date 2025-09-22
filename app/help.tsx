import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function HelpSupportScreen() {
  const { colors } = useTheme();

  const open = (url: string) => {
    try {
      if (!url || url.length > 2048) return;
      Linking.openURL(url).catch((e) => console.log('[Help] openURL error', e));
    } catch (e) {
      console.log('[Help] open error', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="help-screen">
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <Text style={[styles.title, { color: colors.text }]}>Need help?</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We usually respond within 24 hours.</Text>

      <TouchableOpacity style={[styles.link, { borderColor: colors.border }]} onPress={() => open('mailto:support@phantomroom.io')} testID="help-email">
        <Text style={[styles.linkText, { color: colors.primary }]}>Email support@phantomroom.io</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.link, { borderColor: colors.border }]} onPress={() => open('https://phantomroom.io/help')} testID="help-faq">
        <Text style={[styles.linkText, { color: colors.primary }]}>Open FAQs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  link: { paddingVertical: 14, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  linkText: { fontWeight: '700' },
});