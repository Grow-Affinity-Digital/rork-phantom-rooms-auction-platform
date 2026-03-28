import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Clock, DollarSign, BellRing, Settings2, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useStorage } from '@/providers/StorageProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface AlertItem {
  id: string;
  type: 'outbid' | 'ending' | 'reserve';
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  color: string;
}

interface AlertPrefs {
  free: {
    outbid: boolean;
    endingSoon: boolean;
    reserveMet: boolean;
  };
  premium: {
    priceDrops: boolean;
    newMatches: boolean;
    marketTrends: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
  };
}

const DEFAULT_PREFS: AlertPrefs = {
  free: {
    outbid: true,
    endingSoon: true,
    reserveMet: true,
  },
  premium: {
    priceDrops: true,
    newMatches: true,
    marketTrends: false,
    frequency: 'instant',
  },
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getItem, setItem } = useStorage();
  const { colors } = useTheme();

  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string>('');

  const roleKey = (user?.role ?? 'visitor') as string;
  const STORAGE_KEY = `alert_prefs_${roleKey}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await getItem(STORAGE_KEY);
        if (!mounted) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AlertPrefs>;
          const merged: AlertPrefs = {
            free: { ...DEFAULT_PREFS.free, ...(parsed.free ?? {}) },
            premium: { ...DEFAULT_PREFS.premium, ...(parsed.premium ?? {}) },
          };
          setPrefs(merged);
        } else {
          setPrefs(DEFAULT_PREFS);
        }
      } catch (e) {
        console.log('[Alerts] load prefs error', e);
      }
    })();
    return () => { mounted = false; };
  }, [STORAGE_KEY, getItem]);

  const alerts: AlertItem[] = useMemo(() => ([
    {
      id: '1',
      type: 'outbid',
      title: "You've been outbid",
      description: 'Golden Nugget Game Room - Atlanta',
      time: '2 minutes ago',
      icon: TrendingUp,
      color: '#EF4444',
    },
    {
      id: '2',
      type: 'ending',
      title: 'Auction ending soon',
      description: 'Lucky 7 Route - Wyoming',
      time: '1 hour ago',
      icon: Clock,
      color: '#F59E0B',
    },
    {
      id: '3',
      type: 'reserve',
      title: 'Reserve met',
      description: 'Diamond Palace - Nebraska',
      time: '3 hours ago',
      icon: DollarSign,
      color: '#10B981',
    },
  ]), []);

  const transientSave = useCallback((message: string) => {
    setIsSaving(false);
    setSaveBanner(message);
    setTimeout(() => setSaveBanner(''), 1500);
  }, []);

  const persist = useCallback(async (next: AlertPrefs) => {
    try {
      await setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log('[Alerts] save prefs error', e);
    }
  }, [STORAGE_KEY, getItem]);

  const handlePremiumToggle = useCallback((key: keyof AlertPrefs['premium'], value: boolean) => {
    if (!user?.isSubscribed) {
      router.push({ pathname: '/paywall', params: { source: 'alerts-premium' } });
      return;
    }
    const next: AlertPrefs = { ...prefs, premium: { ...prefs.premium, [key]: value } };
    setPrefs(next);
    persist(next);
    transientSave('Preferences updated');
  }, [prefs, user?.isSubscribed, transientSave, persist]);

  const handleFreeToggle = useCallback((key: keyof AlertPrefs['free'], value: boolean) => {
    const next: AlertPrefs = { ...prefs, free: { ...prefs.free, [key]: value } };
    setPrefs(next);
    persist(next);
    transientSave('Preferences updated');
  }, [prefs, transientSave, persist]);

  const changeFrequency = useCallback((freq: AlertPrefs['premium']['frequency']) => {
    if (!user?.isSubscribed) {
      router.push({ pathname: '/paywall', params: { source: 'alerts-premium-frequency' } });
      return;
    }
    const next: AlertPrefs = { ...prefs, premium: { ...prefs.premium, frequency: freq } };
    setPrefs(next);
    persist(next);
    transientSave('Frequency saved');
  }, [prefs, user?.isSubscribed, transientSave, persist]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    persist(prefs).finally(() => setTimeout(() => transientSave('Preferences saved'), 400));
  }, [transientSave, persist, prefs]);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]} testID="alerts-screen">
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => transientSave('All marked as read')}
          testID="mark-all-read"
        >
          <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {saveBanner ? (
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]} testID="save-banner">
          <Text style={[styles.bannerText, { color: colors.text }]}>{saveBanner}</Text>
        </View>
      ) : null}

      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <TouchableOpacity key={alert.id} style={styles.alertCard} testID={`alert-card-${alert.id}`}>
            <LinearGradient
              colors={['#1A1A2E', '#16213E']}
              style={styles.cardGradient}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${alert.color}20` }]}> 
                <Icon color={alert.color} size={20} />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
                <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>{alert.description}</Text>
                <Text style={[styles.alertTime, { color: colors.textSecondary }]}>{alert.time}</Text>
              </View>
              <View style={styles.unreadDot} />
            </LinearGradient>
          </TouchableOpacity>
        );
      })}

      <View style={styles.settingsSection}>
        <Text style={[styles.settingsTitle, { color: colors.text }]}>Notification Settings</Text>

        <View style={styles.sectionHeader}>
          <BellRing color={colors.primary} size={18} />
          <Text style={[styles.sectionHeaderText, { color: colors.text }]}>Free Alerts</Text>
        </View>
        <View style={[styles.prefRow, { borderBottomColor: colors.border }]} testID="pref-free-outbid">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Outbid alerts</Text>
          <Switch
            value={prefs.free.outbid}
            onValueChange={(v) => handleFreeToggle('outbid', v)}
          />
        </View>
        <View style={[styles.prefRow, { borderBottomColor: colors.border }]} testID="pref-free-ending">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Ending soon</Text>
          <Switch
            value={prefs.free.endingSoon}
            onValueChange={(v) => handleFreeToggle('endingSoon', v)}
          />
        </View>
        <View style={[styles.prefRow, { borderBottomColor: colors.border }]} testID="pref-free-reserve">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Reserve met</Text>
          <Switch
            value={prefs.free.reserveMet}
            onValueChange={(v) => handleFreeToggle('reserveMet', v)}
          />
        </View>

        <View style={[styles.sectionHeader, styles.sectionHeaderSpacing]}> 
          <Sparkles color="#F59E0B" size={18} />
          <Text style={[styles.sectionHeaderText, { color: colors.text }]}>Premium Alerts</Text>
        </View>

        {!user?.isSubscribed ? (
          <TouchableOpacity
            style={[styles.premiumCta, { backgroundColor: colors.card, borderColor: colors.primary }]}
            onPress={() => router.push({ pathname: '/paywall', params: { source: 'alerts-upgrade' } })}
            testID="premium-upgrade-cta"
          >
            <Text style={[styles.premiumCtaTitle, { color: colors.text }]}>Unlock Preferred Alerts</Text>
            <Text style={[styles.premiumCtaSubtitle, { color: colors.textSecondary }]}>Price drops • New matches • Market trends</Text>
            <Text style={[styles.premiumCtaPrice, { color: colors.primary }]}>From $9.99/mo</Text>
          </TouchableOpacity>
        ) : null}

        <View style={[styles.prefRow, { borderBottomColor: colors.border }, user?.isSubscribed ? null : styles.disabledRow]} testID="pref-premium-pricedrops">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Price drop alerts</Text>
          <Switch
            disabled={!user?.isSubscribed}
            value={prefs.premium.priceDrops}
            onValueChange={(v) => handlePremiumToggle('priceDrops', v)}
          />
        </View>
        <View style={[styles.prefRow, { borderBottomColor: colors.border }, user?.isSubscribed ? null : styles.disabledRow]} testID="pref-premium-newmatches">
          <Text style={[styles.prefLabel, { color: colors.text }]}>New listings match</Text>
          <Switch
            disabled={!user?.isSubscribed}
            value={prefs.premium.newMatches}
            onValueChange={(v) => handlePremiumToggle('newMatches', v)}
          />
        </View>
        <View style={[styles.prefRow, { borderBottomColor: colors.border }, user?.isSubscribed ? null : styles.disabledRow]} testID="pref-premium-trends">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Market trends</Text>
          <Switch
            disabled={!user?.isSubscribed}
            value={prefs.premium.marketTrends}
            onValueChange={(v) => handlePremiumToggle('marketTrends', v)}
          />
        </View>

        <View style={[styles.frequencyRow, user?.isSubscribed ? null : styles.disabledRow]} testID="pref-premium-frequency">
          <Text style={[styles.prefLabel, { color: colors.text }]}>Frequency</Text>
          <View style={styles.frequencyChips}>
            {(['instant','daily','weekly'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, prefs.premium.frequency === f ? styles.chipActive : null]}
                onPress={() => changeFrequency(f)}
                disabled={!user?.isSubscribed}
              >
                <Text style={[styles.chipText, prefs.premium.frequency === f ? styles.chipTextActive : null]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.card }]} disabled={isSaving} testID="prefs-save-btn" onPress={handleSave}>
          <View style={styles.settingsButtonInner}>
            <Settings2 color={colors.primary} size={18} />
            <Text style={[styles.settingsButtonText, styles.settingsButtonTextSpacing, { color: colors.primary }]}>{isSaving ? 'Saving...' : 'Save Preferences'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '500',
  },
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  alertTime: {
    fontSize: 12,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  settingsSection: {
    padding: 20,
    marginTop: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderSpacing: {
    marginTop: 24,
  },
  sectionHeaderText: {
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  disabledRow: {
    opacity: 0.6,
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  frequencyRow: {
    marginTop: 12,
    marginBottom: 8,
  },
  frequencyChips: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    borderColor: '#374151',
  },
  chipActive: {
    backgroundColor: '#111827',
    borderColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextActive: {
    color: '#8B5CF6',
  },
  premiumCta: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  premiumCtaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  premiumCtaSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  premiumCtaPrice: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
  settingsButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  settingsButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsButtonTextSpacing: {
    marginLeft: 8,
  },
});