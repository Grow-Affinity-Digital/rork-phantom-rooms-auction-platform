import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Clock, MapPin, TrendingUp, Lock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { mockListings } from '@/mocks/listings';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const categories = ['Featured', 'Ending Soon', 'New', 'Routes', 'Licenses', 'Saved'];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('Featured');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: listings } = useQuery({
    queryKey: ['listings', selectedCategory],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockListings;
    },
  });

  const handleCategoryPress = (category: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCategory(category);
  };

  const { user } = useAuth();

  const handleListingPress = (listingId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const listing = listings?.find(l => l.id === listingId);
    if (listing?.depositRequired && (!user?.isSubscribed)) {
      router.push({
        pathname: '/paywall',
        params: { source: 'listing' }
      });
      return;
    }

    router.push(`/listing/${listingId}`);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="explore-container">
      <Animated.View style={[styles.header, { opacity: headerOpacity, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryPress(category)}
              style={[
                styles.categoryPill,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedCategory === category && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.textSecondary },
                  selectedCategory === category && { color: '#FFF' },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {listings?.map((listing, index) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onPress={() => handleListingPress(listing.id)}
            index={index}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

interface ListingCardProps {
  listing: any;
  onPress: () => void;
  index: number;
}

function ListingCard({ listing, onPress, index }: ListingCardProps) {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 50,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [index, scaleAnim]);

  const formatTimeLeft = (endAt: Date) => {
    const now = new Date();
    const diff = endAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const darkCardGradient: [string, string] = isDark ? ['#1A1A2E', '#16213E'] : ['#10131A', '#141A26'];

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: scaleAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} testID="listing-card" onPressIn={() => console.log('ListingCard pressIn', listing?.id)} onPressOut={() => console.log('ListingCard pressOut', listing?.id)}>
        <LinearGradient
          colors={darkCardGradient}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{listing.type}</Text>
              </View>
              {listing.reserveMet && (
                <View style={styles.reserveBadge} testID="reserve-badge">
                  <TrendingUp color="#10B981" size={14} />
                  <Text style={styles.reserveText}>Reserve Met</Text>
                </View>
              )}
            </View>
            <View style={styles.headerRight}>
              {listing.depositRequired && (
                <View style={styles.depositBadge} testID="deposit-badge">
                  <Lock color="#F59E0B" size={12} />
                  <Text style={styles.depositText}>Deposit to Unlock</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.cardTitle}>{listing.title}</Text>
          
          <View style={styles.cardLocation}>
            <MapPin color="#666" size={14} />
            <Text style={styles.locationText}>
              {listing.locationCity}, {listing.locationState}
            </Text>
          </View>

          <Text style={styles.cardSummary} numberOfLines={2}>
            {listing.summary}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentBid}>Current Bid</Text>
              <Text style={styles.price}>{formatPrice(listing.currentBid)}</Text>
            </View>

            <View style={styles.timeContainer}>
              <Clock color="#8B5CF6" size={16} />
              <Text style={styles.timeText}>{formatTimeLeft(listing.endAt)}</Text>
            </View>
          </View>

          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)']}
            style={styles.cardGlow}
            pointerEvents="none"
          />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  reserveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  reserveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  cardSummary: {
    fontSize: 14,
    color: '#A3A3A3',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  currentBid: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  depositBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  depositText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
});
