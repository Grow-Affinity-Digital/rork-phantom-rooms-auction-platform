import React, { useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageContextType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const [StorageProvider, useStorage] = createContextHook<StorageContextType>(() => {
  const getItem = useCallback(async (key: string) => {
    if (!key || key.length > 128) return null;
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.log('[Storage] getItem error', e);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string) => {
    if (!key || key.length > 128) return;
    if (typeof value !== 'string' || value.length > 20000) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log('[Storage] setItem error', e);
    }
  }, []);

  const removeItem = useCallback(async (key: string) => {
    if (!key || key.length > 128) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log('[Storage] removeItem error', e);
    }
  }, []);

  return useMemo(() => ({ getItem, setItem, removeItem }), [getItem, setItem, removeItem]);
});