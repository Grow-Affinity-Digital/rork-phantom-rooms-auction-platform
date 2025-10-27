import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  CreditCard, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight, Moon, Sun, Check
} from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, mode, setMode, toggleTheme, isDark, palette, primaryColor, setPrimaryColor } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const menuItems = useMemo(() => ([
    { icon: User, label: 'Account Details', action: () => router.push('/account-details') },
    { icon: CreditCard, label: 'Subscription & Billing', action: () => router.push('/subscription') },
    { icon: Shield, label: 'KYC Verification', action: () => router.push('/kyc') },
    { icon: Bell, label: 'Notification Settings', action: () => router.push('/notifications') },
    { icon: HelpCircle, label: 'Help & Support', action: () => router.push('/help') },
  ]), []);

  const handleSignOut = () => {
    console.log('[Profile] Sign out pressed');
    signOut();
    router.replace('/onboarding');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} testID="profile-scroll">
      <LinearGradient
        colors={colors.gradientPrimary}
        style={styles.profileHeader}
      >
        <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)' }]}
          testID="profile-avatar">
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: isDark ? '#FFF' : colors.background }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.userEmail, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)' }]}>{user?.email || 'user@example.com'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
          testID="role-badge">
          <Text style={[styles.roleText, { color: isDark ? '#FFF' : colors.background }]}>{user?.role?.toUpperCase() || 'BUYER'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.subscriptionCard}>
        <LinearGradient
          colors={[isDark ? colors.card : colors.surface, isDark ? colors.surfaceElevated : colors.card]}
          style={styles.subscriptionGradient}
        >
          <Text style={[styles.subscriptionTitle, { color: colors.text }]}>Premium Member</Text>
          <Text style={[styles.subscriptionPrice, { color: colors.primary }]}>$19.98/month</Text>
          <Text style={[styles.subscriptionStatus, { color: colors.textSecondary }]}>Active until Dec 31, 2025</Text>
        </LinearGradient>
      </View>

      <View style={styles.menuSection}>
        {/* Appearance */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.modeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            testID="toggle-theme"
          >
            {isDark ? <Sun color={colors.text} size={18} /> : <Moon color={colors.text} size={18} />}
            <Text style={[styles.modeButtonText, { color: colors.text }]}>{isDark ? 'Switch to Light' : 'Switch to Dark'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modeRow}>
          {(['system','light','dark'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.chip, { backgroundColor: mode === m ? colors.primary : colors.card, borderColor: colors.border }]}
              testID={`mode-${m}`}
            >
              <Text style={[styles.chipText, { color: mode === m ? colors.background : colors.text, fontWeight: mode === m ? '700' : '500' }]}>{m.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Colors</Text>
        </View>
        <View style={styles.paletteRow}>
          {palette.map((c) => {
            const selected = primaryColor.toLowerCase() === c.toLowerCase();
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setPrimaryColor(c)}
                style={[styles.swatch, { backgroundColor: c, borderColor: selected ? '#fff' : colors.border, shadowColor: c }]}
                testID={`color-swatch-${c.replace(/[^a-zA-Z0-9]/g,'')}`}
                accessibilityLabel={`Choose color ${c}`}
              >
                {selected ? <Check color={isDark ? '#0A0A0B' : '#fff'} size={14} /> : null}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setPrimaryColor('')}
            style={[styles.resetChip, { borderColor: colors.border, backgroundColor: colors.card }]}
            testID="color-reset"
          >
            <Text style={[styles.resetText, { color: colors.text }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const key = item.label.replace(/\s+/g, '-').toLowerCase();
          const isSelected = selected === key;
          const onPress = () => {
            console.log('[Profile] Menu press', key);
            setSelected(key);
            setTimeout(() => item.action(), 80);
          };
          return (
            <Pressable
              key={item.label}
              onPress={onPress}
              onHoverIn={() => setSelected(key)}
              onHoverOut={() => setSelected((cur) => (cur === key ? null : cur))}
              style={({ pressed }) => [
                styles.menuItem,
                { borderBottomColor: colors.border, backgroundColor: pressed || isSelected ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : 'transparent' },
              ]}
              testID={`menu-${key}`}
              accessibilityRole="button"
            >
              <View style={styles.menuItemLeft}>
                <Icon color={colors.primary} size={20} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
              </View>
              <ChevronRight color={colors.textSecondary} size={20} />
            </Pressable>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.card }]}
        onPress={handleSignOut}
        testID="signout-button">
        <LogOut color="#EF4444" size={20} />
        <Text style={[styles.signOutText]}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionCard: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 12,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginLeft: 8,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 4,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
});