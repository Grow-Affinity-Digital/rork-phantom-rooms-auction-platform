import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  input: string;
  overlay: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  accent: string;
  accent2: string;
  accent3: string;
  link: string;
  gradientPrimary: [string, string];
  gradientAccent: [string, string];
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  colors: ThemeColors;
  palette: string[];
  mode: ThemeMode;
  isDark: boolean;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const darkTheme: ThemeColors = {
  primary: '#8B5CF6',
  secondary: '#6366F1',
  background: '#0A0A0B',
  surface: '#121217',
  surfaceElevated: '#1C1C27',
  card: '#1A1A2E',
  input: '#0F0F14',
  overlay: 'rgba(0,0,0,0.6)',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#2A2A3E',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: '#22D3EE',
  accent2: '#F472B6',
  accent3: '#34D399',
  link: '#60A5FA',
  gradientPrimary: ['#8B5CF6', '#6366F1'],
  gradientAccent: ['#22D3EE', '#8B5CF6'],
};

const lightTheme: ThemeColors = {
  primary: '#6D28D9',
  secondary: '#4338CA',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceElevated: '#F1F5F9',
  card: '#FFFFFF',
  input: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.08)',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  accent: '#0891B2',
  accent2: '#DB2777',
  accent3: '#10B981',
  link: '#2563EB',
  gradientPrimary: ['#8B5CF6', '#6366F1'],
  gradientAccent: ['#06B6D4', '#8B5CF6'],
};

const brandPalette: string[] = [
  '#8B5CF6',
  '#6366F1',
  '#22D3EE',
  '#F472B6',
  '#34D399',
  '#F59E0B',
  '#60A5FA',
  '#F43F5E',
  '#A3E635',
];

const THEME_KEY = 'app_theme_mode_v1';
const THEME_ACCENT_KEY = 'app_theme_primary_v1';

export const [ThemeProvider, useTheme] = createContextHook<ThemeContextType>(() => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const [primaryColor, setPrimaryColorState] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(THEME_ACCENT_KEY),
    ])
      .then(([storedMode, storedAccent]) => {
        if (!mounted) return;
        const parsed = storedMode as ThemeMode | null;
        if (parsed === 'light' || parsed === 'dark' || parsed === 'system') {
          setModeState(parsed);
        }
        if (storedAccent && typeof storedAccent === 'string') {
          setPrimaryColorState(storedAccent);
        }
      })
      .catch((e) => console.log('[Theme] load error', e));

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    return () => {
      mounted = false;
      if (typeof (sub as any)?.remove === 'function') (sub as any).remove();
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    const next = m === 'light' || m === 'dark' || m === 'system' ? m : 'system';
    setModeState(next);
    AsyncStorage.setItem(THEME_KEY, next).catch((e) => console.log('[Theme] save error', e));
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    const safe = typeof color === 'string' && color.trim().length > 0 ? color : '';
    setPrimaryColorState(safe);
    AsyncStorage.setItem(THEME_ACCENT_KEY, safe).catch((e) => console.log('[Theme] save accent error', e));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setMode(next);
  }, [isDark, setMode]);

  const base = isDark ? darkTheme : lightTheme;
  const computedPrimary = primaryColor || base.primary;
  const colors = useMemo<ThemeColors>(() => ({
    ...base,
    primary: computedPrimary,
    gradientPrimary: [computedPrimary, base.secondary],
  }), [base, computedPrimary]);

  const value = useMemo<ThemeContextType>(() => ({
    colors,
    palette: brandPalette,
    mode,
    isDark,
    primaryColor: computedPrimary,
    setPrimaryColor,
    setMode,
    toggleTheme,
  }), [colors, mode, isDark, computedPrimary, setPrimaryColor, setMode, toggleTheme]);

  if (Platform.OS === 'web') {
    const root = document?.documentElement;
    if (root) {
      root.style.backgroundColor = colors.background;
      root.style.color = colors.text;
    }
  }

  return value;
});