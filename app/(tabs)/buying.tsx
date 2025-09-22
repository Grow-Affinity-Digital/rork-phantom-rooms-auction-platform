import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, Heart, Clock, Lock } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function BuyingScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  if (!user?.isSubscribed) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.lockedContent} testID="buying-locked">
        <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.lockedCard}>
          <Lock color="#F59E0B" size={28} />
          <Text style={[styles.lockedTitle, { color: '#FFF' }]}>Premium Required</Text>
          <Text style={[styles.lockedSubtitle, { color: colors.textSecondary }]}>Upgrade to track bids and manage your buying.</Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => router.push({ pathname: '/paywall', params: { source: 'tab-buying' } })}
            testID="buying-upgrade"
          >
            <LinearGradient colors={[colors.gradientPrimary[0], colors.gradientPrimary[1]]} style={styles.subscribeGradient}>
              <Text style={styles.subscribeText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    );
  }

  const sections = [
    { title: 'Active Bids', count: 2, icon: ShoppingBag },
    { title: 'Watching', count: 5, icon: Heart },
    { title: 'Recently Viewed', count: 8, icon: Clock },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Buying Activity</Text>
      </View>

      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <TouchableOpacity key={index} style={styles.sectionCard}>
            <LinearGradient
              colors={['#1A1A2E', '#16213E']}
              style={styles.cardGradient}
            >
              <View style={styles.cardLeft}>
                <Icon color="#8B5CF6" size={24} />
                <View style={styles.cardContent}>
                  <Text style={[styles.sectionTitle, { color: '#FFF' }]}>{section.title}</Text>
                  <Text style={[styles.sectionCount, { color: '#666' }]}>{section.count} items</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{section.count}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}

      <View style={styles.tipsSection}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>Bidding Tips</Text>
        <View style={styles.tipCard}>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Set a maximum bid and stick to it
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }] }>
            • Research comparable sales before bidding
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }] }>
            • Pay deposits to unlock full details
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }] }>
            • Watch for anti-snipe extensions
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lockedContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  lockedCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  subscribeButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
  },
  subscribeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  tipsSection: {
    padding: 20,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 24,
  },
});