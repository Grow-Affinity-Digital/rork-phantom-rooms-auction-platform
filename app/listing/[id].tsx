import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  Clock, 
  MapPin, 
  Lock, 
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  DollarSign
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { mockListings } from '@/mocks/listings';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isWatching, setIsWatching] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: listing } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockListings.find(l => l.id === id) || mockListings[0];
    },
  });

  const handleBidPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/bid-modal');
  };

  const handleDepositPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/deposit-modal');
  };

  const handleWatchPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsWatching(!isWatching);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeLeft = (endAt: Date) => {
    const now = new Date();
    const diff = endAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  if (!listing) return null;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <LinearGradient
          colors={['#8B5CF6', '#6366F1', '#0A0A0B']}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{listing.type}</Text>
            </View>
            
            <Text style={styles.title}>{listing.title}</Text>
            
            <View style={styles.locationRow}>
              <MapPin color="#CCC" size={16} />
              <Text style={styles.location}>
                {listing.locationCity}, {listing.locationState}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Current Bid</Text>
                <Text style={styles.statValue}>{formatPrice(listing.currentBid)}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Time Left</Text>
                <View style={styles.timeRow}>
                  <Clock color="#8B5CF6" size={16} />
                  <Text style={styles.statValue}>{formatTimeLeft(listing.endAt)}</Text>
                </View>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Bids</Text>
                <Text style={styles.statValue}>{listing.bidCount}</Text>
              </View>
            </View>

            {listing.reserveMet && (
              <View style={styles.reserveMetBadge}>
                <TrendingUp color="#10B981" size={16} />
                <Text style={styles.reserveMetText}>Reserve Met</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{listing.summary}</Text>
          </View>

          {listing.depositRequired && (
            <TouchableOpacity style={styles.depositCard} onPress={handleDepositPress}>
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                style={styles.depositGradient}
              >
                <Lock color="#FFF" size={20} />
                <View style={styles.depositContent}>
                  <Text style={styles.depositTitle}>Unlock Full Details</Text>
                  <Text style={styles.depositAmount}>
                    {formatPrice(listing.depositAmount)} refundable deposit
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{listing.type}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Revenue</Text>
                <Text style={styles.detailValue}>$250K/year</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Established</Text>
                <Text style={styles.detailValue}>2018</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Machines</Text>
                <Text style={styles.detailValue}>45 units</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Notes</Text>
            <Text style={styles.description}>
              Well-established game room with loyal customer base. All equipment recently serviced.
              Prime location with high foot traffic. Includes all licenses and permits.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments ({listing.comments?.length || 0})</Text>
            {listing.depositRequired ? (
              <View style={styles.commentsLocked}>
                <Lock color="#666" size={20} />
                <Text style={styles.commentsLockedText}>
                  Pay deposit to view and post comments
                </Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                <Text style={styles.noComments}>No comments yet</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleWatchPress}>
            <Heart 
              color={isWatching ? '#EF4444' : '#666'} 
              size={24}
              fill={isWatching ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 color="#666" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MessageCircle color="#666" size={24} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.bidButton} onPress={handleBidPress}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.bidGradient}
          >
            <DollarSign color="#FFF" size={20} />
            <Text style={styles.bidButtonText}>Place Bid</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroGradient: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  location: {
    fontSize: 16,
    color: '#CCC',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reserveMetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 20,
  },
  reserveMetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#999',
    lineHeight: 24,
  },
  depositCard: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  depositGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  depositContent: {
    marginLeft: 12,
  },
  depositTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  depositAmount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  commentsLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
  },
  commentsLockedText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  commentsList: {
    paddingVertical: 20,
  },
  noComments: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0A0B',
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 12,
    marginRight: 8,
  },
  bidButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginLeft: 16,
  },
  bidGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
});