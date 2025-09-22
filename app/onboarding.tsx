import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, Gamepad2, TrendingUp, Shield, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');



const slides = [
  {
    icon: Gamepad2,
    title: "Verified Listings.\nReal Locations.",
    subtitle: "Every game room and route is vetted by our team",
    gradient: ['#8B5CF6', '#6366F1'],
  },
  {
    icon: TrendingUp,
    title: "Transparent Auctions.\nFair Fees.",
    subtitle: "1% seller fee, 3% buyer fee. No hidden costs.",
    gradient: ['#6366F1', '#06B6D4'],
  },
  {
    icon: Shield,
    title: "Unlock Details\nwith a Deposit.",
    subtitle: "Protect sensitive information until buyers are serious",
    gradient: ['#06B6D4', '#10B981'],
  },
  {
    icon: Sparkles,
    title: "Pro Marketing\nor DIY—You Choose.",
    subtitle: "Optional $1,000 marketing kit for premium listings",
    gradient: ['#10B981', '#8B5CF6'],
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: width * nextSlide, animated: true });
    } else {
      // After slides, go directly to auth
      router.replace('/(auth)/sign-up');
    }
  };







  return (
    <LinearGradient colors={['#0A0A0B', '#1A1A2E']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.scrollView}
          >
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <View key={index} style={styles.slide}>
                  <LinearGradient colors={slide.gradient as [string, string]} style={styles.iconContainer}>
                    <Icon color="#FFF" size={48} />
                  </LinearGradient>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.pagination}>
              {slides.map((_, index) => (
                <View key={index} style={[styles.paginationDot, index === currentSlide && styles.paginationDotActive]} />
              ))}
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext} testID="slides-next">
              <LinearGradient colors={['#8B5CF6', '#6366F1']} style={styles.buttonGradient}>
                <Text style={styles.nextButtonText}>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
                <ChevronRight color="#FFF" size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#8B5CF6',
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },



});