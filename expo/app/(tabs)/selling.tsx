import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plus, Package, Clock, DollarSign, Lock } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function SellingScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  if (!user?.isSubscribed) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.lockedContent} testID="selling-locked">
        <LinearGradient colors={['#1A1A2E', '#16213E']} style={styles.lockedCard}>
          <Lock color="#F59E0B" size={28} />
          <Text style={[styles.lockedTitle, { color: '#FFF' }]}>Premium Required</Text>
          <Text style={[styles.lockedSubtitle, { color: isDark ? '#999' : '#475569' }]}>Upgrade to create and manage listings.</Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => router.push({ pathname: '/paywall', params: { source: 'tab-selling' } })}
            testID="selling-upgrade"
          >
            <LinearGradient colors={[colors.gradientPrimary[0], colors.gradientPrimary[1]]} style={styles.subscribeGradient}>
              <Text style={[styles.subscribeText, { color: colors.background }]}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    );
  }

  const stats = [
    { label: 'Active Listings', value: '3', icon: Package },
    { label: 'Total Bids', value: '47', icon: Clock },
    { label: 'Revenue', value: '$125K', icon: DollarSign },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back,</Text>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Seller'}</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <LinearGradient
              key={index}
              colors={['#1A1A2E', '#16213E']}
              style={styles.statCard}
            >
              <Icon color={colors.primary} size={20} />
              <Text style={[styles.statValue, { color: '#FFF' }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: isDark ? '#666' : colors.textSecondary }]}>{stat.label}</Text>
            </LinearGradient>
          );
        })}
      </View>

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => {
          if (!user?.isSubscribed) {
            router.push({ pathname: '/paywall', params: { source: 'listing-creation' } });
          } else {
            router.push('/create-listing');
          }
        }}
      >
        <LinearGradient
          colors={[colors.gradientPrimary[0], colors.gradientPrimary[1]]}
          style={styles.buttonGradient}
        >
          <Plus color={colors.background} size={24} />
          <Text style={[styles.buttonText, { color: colors.background }]}>Create New Listing</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Listings</Text>
        <View style={styles.emptyState}>
          <Package color={colors.textSecondary} size={48} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No active listings</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Create your first listing to start selling
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
    fontWeight: '700',
  },
  header: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createButton: {
    marginHorizontal: 20,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 32,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});