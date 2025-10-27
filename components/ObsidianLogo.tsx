import React, { memo } from 'react';
import { View, StyleSheet, Image } from 'react-native';

export type LogoProps = {
  size?: number;
  testID?: string;
  variant?: 'color' | 'dark' | 'light';
};

const LOGO_URLS = {
  neonGreen: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cbx2r8ommg61mfu4dg2x7',
  black: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/2h627721ymc80oszj25iq',
  smallIcon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8rojvwkk0i2o4ffkz4nsg',
  roundIcon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/c7nzy7a9aiwvvlcssigiy',
  appIcon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/djxlyo5my5gws21cmaxcf',
  darkIcon: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/undb28vo5hwtk22jkxw6d',
};

export const ObsidianLogo = memo(function ObsidianLogo({ 
  size = 48, 
  testID,
  variant = 'color' 
}: LogoProps) {
  const imageUrl = variant === 'dark' ? LOGO_URLS.black : LOGO_URLS.neonGreen;
  
  return (
    <View style={[styles.box, { width: size, height: size }]} testID={testID ?? 'obsidian-logo'}>
      <Image 
        source={{ uri: imageUrl }} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
});

export const ObsidianIcon = memo(function ObsidianIcon({ 
  size = 24, 
  testID,
  variant = 'dark'
}: LogoProps) {
  const imageUrl = variant === 'color' ? LOGO_URLS.roundIcon : LOGO_URLS.smallIcon;
  
  return (
    <View style={[styles.box, { width: size, height: size }]} testID={testID ?? 'obsidian-icon'}>
      <Image 
        source={{ uri: imageUrl }} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
});

export const ObsidianAppIcon = memo(function ObsidianAppIcon({ 
  size = 120, 
  testID 
}: LogoProps) {
  return (
    <View style={[styles.box, { width: size, height: size }]} testID={testID ?? 'obsidian-app-icon'}>
      <Image 
        source={{ uri: LOGO_URLS.appIcon }} 
        style={{ width: size, height: size, borderRadius: size * 0.2 }}
        resizeMode="cover"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
