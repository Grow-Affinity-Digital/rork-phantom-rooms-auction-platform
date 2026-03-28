import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Shield, 
  TrendingUp, 
  MessageCircle,
  Eye,
  Lock
} from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import * as Haptics from 'expo-haptics';

const features = [
  {
    icon: Eye,
    title: 'View Full Listing Details',
    description: 'Access complete information, photos, and financial data',
    free: false,
    premium: true,
  },
  {
    icon: MessageCircle,
    title: 'Contact Sellers Directly',
    description: 'Message sellers and brokers to ask questions',
    free: false,
    premium: true,
  },
  {
    icon: TrendingUp,
    title: 'Bidding & Offers',
    description: 'Place bids and make offers on listings',
    free: false,
    premium: true,
  },
  {
    icon: Shield,
    title: 'Verified Listings Only',
    description: 'All listings are verified by our team',
    free: true,
    premium: true,
  },
  {
    icon: Zap,
    title: 'Real-time Notifications',
    description: 'Get notified of new listings and bid updates',
    free: false,
    premium: true,
  },
];

export default function PaywallScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { setSubscribed } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubscribe = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsProcessing(true);
    
    // Simulate subscription process
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    
    // Set user as subscribed
    await setSubscribed(true);
    
    setIsProcessing(false);
    
    // Navigate back to where they came from or to explore
    if (source === 'listing') {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const getSourceMessage = () => {
    switch (source) {
      case 'listing':
        return 'To view full listing details and contact the seller, upgrade to Premium.';
      case 'listing-creation':
        return 'To create and manage listings as a seller, upgrade to Premium.';
      case 'bidding':
        return 'To place bids and make offers, upgrade to Premium.';
      case 'messaging':
        return 'To message sellers and brokers, upgrade to Premium.';
      default:
        return 'Unlock all features with Premium access.';
    }
  };

  return (
    <LinearGradient
      colors={['#0A0A0B', '#1A1A2E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X color="#666" size={24} />
          </TouchableOpacity>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                style={styles.crownContainer}
              >
                <Crown color="#FFF" size={32} />
              </LinearGradient>
              
              <Text style={styles.title}>Upgrade to Premium</Text>
              <Text style={styles.subtitle}>{getSourceMessage()}</Text>
            </View>

            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && styles.planCardSelected,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedPlan('yearly');
                }}
              >
                <LinearGradient
                  colors={selectedPlan === 'yearly' ? ['#8B5CF6', '#6366F1'] : ['#1F1F2E', '#2A2A3E']}
                  style={styles.planGradient}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>Yearly</Text>
                    <View style={styles.saveBadge}>
                      <Text style={styles.saveText}>Save 40%</Text>
                    </View>
                  </View>
                  <Text style={styles.planPrice}>$11.99/month</Text>
                  <Text style={styles.planBilled}>Billed annually ($143.88)</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedPlan('monthly');
                }}
              >
                <LinearGradient
                  colors={selectedPlan === 'monthly' ? ['#8B5CF6', '#6366F1'] : ['#1F1F2E', '#2A2A3E']}
                  style={styles.planGradient}
                >
                  <Text style={styles.planTitle}>Monthly</Text>
                  <Text style={styles.planPrice}>$19.99/month</Text>
                  <Text style={styles.planBilled}>Billed monthly</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What&apos;s included:</Text>
              
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureIcon}>
                      <Icon color="#8B5CF6" size={20} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <View style={styles.featureStatus}>
                      {feature.premium ? (
                        <Check color="#10B981" size={20} />
                      ) : (
                        <Lock color="#666" size={16} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={isProcessing ? ['#2A2A3E', '#2A2A3E'] : ['#8B5CF6', '#6366F1']}
                style={styles.subscribeGradient}
              >
                <Text style={styles.subscribeText}>
                  {isProcessing ? 'Processing...' : `Start ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Cancel anytime. No hidden fees. 7-day free trial included.
            </Text>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  planCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  planGradient: {
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  planBilled: {
    fontSize: 14,
    color: '#CCC',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  featureStatus: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});