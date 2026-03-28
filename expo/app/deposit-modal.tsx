import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { X, Lock, CreditCard, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function DepositModal() {
  const [agreed, setAgreed] = useState(false);

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const handlePay = () => {
    if (agreed) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    }
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
              <Text style={styles.title}>Unlock Full Details</Text>
              <TouchableOpacity onPress={handleClose}>
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.infoCard}>
                <Lock color="#F59E0B" size={32} />
                <Text style={styles.infoTitle}>Why a deposit?</Text>
                <Text style={styles.infoText}>
                  Deposits ensure only serious buyers access sensitive business information
                  including exact location, financial records, and seller contact details.
                </Text>
              </View>

              <View style={styles.depositDetails}>
                <Text style={styles.depositAmount}>$500</Text>
                <Text style={styles.depositLabel}>Refundable Deposit</Text>
              </View>

              <View style={styles.benefits}>
                <Text style={styles.benefitsTitle}>You'll unlock:</Text>
                <View style={styles.benefitItem}>
                  <Shield color="#10B981" size={16} />
                  <Text style={styles.benefitText}>Full address and location details</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Shield color="#10B981" size={16} />
                  <Text style={styles.benefitText}>Complete financial statements</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Shield color="#10B981" size={16} />
                  <Text style={styles.benefitText}>Equipment inventory list</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Shield color="#10B981" size={16} />
                  <Text style={styles.benefitText}>Ability to comment and ask questions</Text>
                </View>
              </View>

              <View style={styles.ndaSection}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setAgreed(!agreed)}
                >
                  {agreed && (
                    <View style={styles.checkmark} />
                  )}
                </TouchableOpacity>
                <Text style={styles.ndaText}>
                  I agree to the Non-Disclosure Agreement and understand this deposit
                  is fully refundable if I don't win the auction.
                </Text>
              </View>

              <View style={styles.cardInput}>
                <CreditCard color="#666" size={20} />
                <TextInput
                  style={styles.cardNumber}
                  placeholder="Card ending in ****4242"
                  placeholderTextColor="#666"
                  editable={false}
                />
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[styles.payButton, !agreed && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={!agreed}
            >
              <LinearGradient
                colors={agreed ? ['#8B5CF6', '#6366F1'] : ['#2A2A3E', '#2A2A3E']}
                style={styles.payGradient}
              >
                <Text style={styles.payButtonText}>Pay Deposit</Text>
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
    height: '85%',
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
  infoCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0A0A0B',
    borderRadius: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  depositDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  depositAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F59E0B',
  },
  depositLabel: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  benefits: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#CCC',
    marginLeft: 8,
  },
  ndaSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  ndaText: {
    flex: 1,
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  cardInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardNumber: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  payButton: {
    margin: 20,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});