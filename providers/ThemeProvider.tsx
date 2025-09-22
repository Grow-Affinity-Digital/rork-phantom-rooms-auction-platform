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

const BRAND = {
  purple: '#AB54F7',
  blue: '#4F46E5',
  deepPurple: '#6B46C1',
  dark: '#1E1B4B',
  lightPurple: '#8B5CF6',
} as const;

const darkTheme: ThemeColors = {
  primary: BRAND.purple,
  secondary: BRAND.blue,
  background: BRAND.dark,
  surface: '#17153a',
  surfaceElevated: '#221f52',
  card: '#141236',
  input: '#0F0F2A',
  overlay: 'rgba(0,0,0,0.6)',
  text: '#FFFFFF',
  textSecondary: '#C7C9E2',
  border: '#2C2A5A',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: BRAND.lightPurple,
  accent2: '#F472B6',
  accent3: '#34D399',
  link: '#60A5FA',
  gradientPrimary: [BRAND.purple, BRAND.blue],
  gradientAccent: [BRAND.lightPurple, BRAND.purple],
};

const lightTheme: ThemeColors = {
  primary: BRAND.purple,
  secondary: BRAND.blue,
  background: '#FFFFFF',
  surface: '#F7F7FB',
  surfaceElevated: '#EEF0FB',
  card: '#FFFFFF',
  input: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.08)',
  text: '#111827',
  textSecondary: '#4B5563',
  border: '#E5E7EB',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  accent: BRAND.lightPurple,
  accent2: BRAND.purple,
  accent3: BRAND.blue,
  link: '#2563EB',
  gradientPrimary: [BRAND.purple, BRAND.blue],
  gradientAccent: [BRAND.lightPurple, BRAND.purple],
};

const brandPalette: string[] = [
  BRAND.purple,
  BRAND.blue,
  BRAND.deepPurple,
  BRAND.dark,
  BRAND.lightPurple,
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
    const root = document?.documentElement as HTMLElement | null;
    if (root) {
      root.style.backgroundColor = colors.background;
      root.style.color = colors.text;
      root.style.setProperty('--phantom-purple', BRAND.purple);
      root.style.setProperty('--phantom-blue', BRAND.blue);
      root.style.setProperty('--phantom-dark', BRAND.dark);
      root.style.setProperty('--phantom-light', BRAND.lightPurple);
    }
  }

  return value;
});