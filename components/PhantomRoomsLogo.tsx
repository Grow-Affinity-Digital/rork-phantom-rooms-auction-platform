import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export type LogoProps = {
  size?: number;
  className?: string;
  testID?: string;
};

export const PhantomRoomsLogo = memo(function PhantomRoomsLogo({ size = 48, className, testID }: LogoProps) {
  const s = size;
  return (
    <View style={[styles.box, { width: s, height: s }]} className={className} testID={testID ?? 'phantom-logo'}>
      <Svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="100" y2="100">
            <Stop offset="0%" stopColor="#AB54F7" />
            <Stop offset="100%" stopColor="#4FD1FF" />
          </LinearGradient>
        </Defs>
        <Rect x="6" y="6" width="88" height="88" rx="22" fill="url(#grad)" />
        <Path d="M30 70V30h20c11 0 20 9 20 20s-9 20-20 20H30zm20-12a8 8 0 100-16 8 8 0 000 16z" fill="#0B0B10" />
      </Svg>
    </View>
  );
});

export const PhantomRoomsIcon = memo(function PhantomRoomsIcon({ size = 24, className, testID }: LogoProps) {
  const s = size;
  return (
    <View style={[styles.box, { width: s, height: s }]} className={className} testID={testID ?? 'phantom-icon'}>
      <Svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <Rect x="10" y="10" width="80" height="80" rx="20" fill="#AB54F7" />
        <Path d="M35 65V35h15c8.284 0 15 6.716 15 15s-6.716 15-15 15H35z" fill="#0B0B10" />
      </Svg>
    </View>
  );
});

export const PhantomRoomsAppIcon = memo(function PhantomRoomsAppIcon({ size = 120, className, testID }: LogoProps) {
  const s = size;
  return (
    <View style={[styles.box, { width: s, height: s }]} className={className} testID={testID ?? 'phantom-app-icon'}>
      <Svg width={s} height={s} viewBox="0 0 180 180" fill="none">
        <Defs>
          <LinearGradient id="grad2" x1="0" y1="0" x2="180" y2="180">
            <Stop offset="0%" stopColor="#AB54F7" />
            <Stop offset="100%" stopColor="#4FD1FF" />
          </LinearGradient>
        </Defs>
        <Rect x="8" y="8" width="164" height="164" rx="36" fill="url(#grad2)" />
        <Path d="M55 125V55h35c19.33 0 35 15.67 35 35s-15.67 35-35 35H55zm35-21a14 14 0 100-28 14 14 0 000 28z" fill="#0B0B10" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
