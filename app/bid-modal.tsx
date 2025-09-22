import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X, Plus, Minus, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function BidModal() {
  const [bidAmount, setBidAmount] = useState(55000);
  const currentBid = 50000;
  const minIncrement = 500;

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handleIncrement = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBidAmount(prev => prev + minIncrement);
  };

  const handleDecrement = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (bidAmount > currentBid + minIncrement) {
      setBidAmount(prev => prev - minIncrement);
    }
  };

  const handlePlaceBid = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1A1A2E', '#0A0A0B']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Place Your Bid</Text>
              <TouchableOpacity onPress={handleClose}>
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.currentBidCard}>
                <Text style={styles.currentBidLabel}>Current Bid</Text>
                <Text style={styles.currentBidAmount}>{formatPrice(currentBid)}</Text>
                <Text style={styles.minIncrement}>
                  Minimum increment: {formatPrice(minIncrement)}
                </Text>
              </View>

              <View style={styles.bidInputSection}>
                <Text style={styles.yourBidLabel}>Your Bid</Text>
                <View style={styles.bidControls}>
                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={handleDecrement}
                  >
                    <Minus color="#FFF" size={20} />
                  </TouchableOpacity>
                  
                  <View style={styles.bidAmountContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.bidInput}
                      value={bidAmount.toString()}
                      onChangeText={(text) => setBidAmount(parseInt(text) || 0)}
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.controlButton}
                    onPress={handleIncrement}
                  >
                    <Plus color="#FFF" size={20} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quickBids}>
                <Text style={styles.quickBidsLabel}>Quick Bid</Text>
                <View style={styles.quickBidButtons}>
                  {[1000, 5000, 10000].map((increment) => (
                    <TouchableOpacity
                      key={increment}
                      style={styles.quickBidButton}
                      onPress={() => setBidAmount(currentBid + increment)}
                    >
                      <Text style={styles.quickBidText}>
                        +{formatPrice(increment)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.infoCard}>
                <TrendingUp color="#8B5CF6" size={20} />
                <Text style={styles.infoText}>
                  Anti-snipe protection: Bids in the last 2 minutes extend the auction
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.placeBidButton} onPress={handlePlaceBid}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                style={styles.bidGradient}
              >
                <Text style={styles.placeBidText}>Place Bid</Text>
                <Text style={styles.placeBidAmount}>{formatPrice(bidAmount)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  currentBidCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0A0B',
    borderRadius: 16,
    marginBottom: 24,
  },
  currentBidLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentBidAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  minIncrement: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  bidInputSection: {
    marginBottom: 24,
  },
  yourBidLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  bidControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidAmountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8B5CF6',
    marginRight: 4,
  },
  bidInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
  quickBids: {
    marginBottom: 24,
  },
  quickBidsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quickBidButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBidButton: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickBidText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
    marginLeft: 12,
    lineHeight: 18,
  },
  placeBidButton: {
    margin: 20,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  bidGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  placeBidText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  placeBidAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});