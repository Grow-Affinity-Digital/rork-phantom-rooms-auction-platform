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
  neonGreen: '#D4FF00',
  black: '#0A0A0B',
  darkGray: '#1A1A1A',
  lightGreen: '#E8FF66',
  charcoal: '#141414',
} as const;

const darkTheme: ThemeColors = {
  primary: BRAND.neonGreen,
  secondary: BRAND.lightGreen,
  background: BRAND.black,
  surface: '#141414',
  surfaceElevated: '#1F1F1F',
  card: '#1A1A1A',
  input: '#0F0F0F',
  overlay: 'rgba(0,0,0,0.8)',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2A2A2A',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  accent: BRAND.neonGreen,
  accent2: BRAND.lightGreen,
  accent3: '#34D399',
  link: BRAND.neonGreen,
  gradientPrimary: [BRAND.neonGreen, BRAND.lightGreen],
  gradientAccent: [BRAND.lightGreen, BRAND.neonGreen],
};

const lightTheme: ThemeColors = {
  primary: BRAND.black,
  secondary: BRAND.darkGray,
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceElevated: '#EBEBEB',
  card: '#FFFFFF',
  input: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.08)',
  text: '#0A0A0B',
  textSecondary: '#4B5563',
  border: '#E5E7EB',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  accent: BRAND.neonGreen,
  accent2: BRAND.lightGreen,
  accent3: BRAND.darkGray,
  link: '#0A0A0B',
  gradientPrimary: [BRAND.neonGreen, BRAND.lightGreen],
  gradientAccent: [BRAND.lightGreen, BRAND.neonGreen],
};

const brandPalette: string[] = [
  BRAND.neonGreen,
  BRAND.black,
  BRAND.darkGray,
  BRAND.lightGreen,
  BRAND.charcoal,
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
      root.style.setProperty('--obsidian-neon', BRAND.neonGreen);
      root.style.setProperty('--obsidian-black', BRAND.black);
      root.style.setProperty('--obsidian-dark', BRAND.darkGray);
      root.style.setProperty('--obsidian-light', BRAND.lightGreen);
    }
  }

  return value;
});