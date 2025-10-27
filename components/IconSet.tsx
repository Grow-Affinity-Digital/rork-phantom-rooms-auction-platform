import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ComponentType } from 'react';
import {
  Compass,
  Tag,
  ShoppingCart,
  Bell,
  User,
  Gamepad2,
  Route as RouteIconBase,
  Dice6,
  Building2,
  MapPin,
  Filter as FilterIconBase,
  Search as SearchIconBase,
} from 'lucide-react-native';

export type IconProps = {
  size?: number;
  color?: string;
  testID?: string;
};

function createIcon(IconComp: ComponentType<{ size?: number; color?: string }>) {
  const C = ({ size = 24, color = '#111827', testID }: IconProps) => {
    return (
      <View style={styles.iconWrap} testID={testID ?? 'icon-wrap'}>
        <IconComp size={size} color={color} />
      </View>
    );
  };
  return memo(C);
}

export const ExploreIcon = createIcon(Compass);
export const SellingIcon = createIcon(Tag);
export const BuyingIcon = createIcon(ShoppingCart);
export const AlertsIcon = createIcon(Bell);
export const ProfileIcon = createIcon(User);
export const GameRoomIcon = createIcon(Gamepad2);
export const RouteIcon = createIcon(RouteIconBase);
export const CasinoIcon = createIcon(Dice6);
export const BusinessIcon = createIcon(Building2);
export const LocationIcon = createIcon(MapPin);
export const FilterIcon = createIcon(FilterIconBase);
export const SearchIcon = createIcon(SearchIconBase);

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
