import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentLight: '#f7edec',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  success: '#6abf7b',
  successLight: '#e8f5e9',
};

// TODO (Hunia & Aynour):
// Connect the handlePlaceOrder function to your backend.
// API Endpoint: POST /api/orders
// Request body:
// {
//   items: [...],           // array of cart items
//   paymentMethod: 'card' | 'cash',
//   total: 1250.00,
//   deliveryAddress: { ... },
//   cardDetails: { ... }    // only if paymentMethod is 'card'
// }
// Response: { success: true, orderId: 'ord_123' }

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, maxLength, secureTextEntry }) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
    />
  </View>
);

const formatCardNumber = (text) => {
  const cleaned = text.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
};

export default function PaymentScreen({ navigation, route }) {
  const { items = [], total = 0 } = route.params || {};
  const safeTotal = parseFloat(total) || 0;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const { clearCart } = useCart();

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && cardName && expiry.length === 5 && cvv.length >= 3;
  const isCashValid = address && city && phone;
  const canProceed = paymentMethod === 'card' ? isCardValid : isCashValid;

  const handlePlaceOrder = async () => {
    if (!canProceed) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }

    setTimeout(() => {
      setPlacing(false);
      clearCart();        // ← add this
      setOrderSuccess(true);
    }, 1500);

    setPlacing(true);

    // TODO (Hunia & Aynour): Replace the setTimeout below with your real API call.
    // Example:
    // try {
    //   const res = await fetch('/api/orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    //     body: JSON.stringify({
    //       items,
    //       paymentMethod,
    //       total,
    //       deliveryAddress: { address, city, phone },
    //       cardDetails: paymentMethod === 'card' ? { cardNumber, cardName, expiry } : null,
    //     }),
    //   });
    //   const data = await res.json();
    //   if (data.success) { setOrderSuccess(true); }
    // } catch (err) { Alert.alert('Error', err.message); }
    // finally { setPlacing(false); }

    setTimeout(() => {
      setPlacing(false);
      setOrderSuccess(true);
    }, 1500);
  };

  //Order Placed Success Screen
  if (orderSuccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>
            Your order has been confirmed.{'\n'}
            {paymentMethod === 'cash' ? 'Pay on delivery when your items arrive.' : 'Payment processed successfully.'}
          </Text>

          <View style={styles.successDetails}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total paid</Text>
              <Text style={styles.successValue}>EGP {safeTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Payment</Text>
              <Text style={styles.successValue}>{paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Items</Text>
              <Text style={styles.successValue}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.backToShopBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
            activeOpacity={0.85}
          >
            <Text style={styles.backToShopBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Order summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item) => (
              <View key={item._id} style={styles.orderItem}>
                <Text style={styles.orderItemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.orderItemPrice}>EGP {item.price}</Text>
              </View>
            ))}
            <View style={styles.orderDivider} />
            <View style={styles.orderItem}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalValue}>EGP {safeTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[styles.methodBtn, paymentMethod === 'card' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.85}
              >
                <Ionicons name="card-outline" size={20} color={paymentMethod === 'card' ? COLORS.white : COLORS.accent} />
                <Text style={[styles.methodText, paymentMethod === 'card' && styles.methodTextActive]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, paymentMethod === 'cash' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('cash')}
                activeOpacity={0.85}
              >
                <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cash' ? COLORS.white : COLORS.accent} />
                <Text style={[styles.methodText, paymentMethod === 'cash' && styles.methodTextActive]}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card form */}
          {paymentMethod === 'card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              <InputField
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="numeric"
                maxLength={19}
              />
              <InputField
                label="Cardholder Name"
                placeholder="Name on card"
                value={cardName}
                onChangeText={setCardName}
              />
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="CVV"
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              <View style={styles.secureNote}>
                <Ionicons name="lock-closed-outline" size={13} color={COLORS.muted} />
                <Text style={styles.secureText}>Your payment info is encrypted and secure</Text>
              </View>
            </View>
          )}

          {/* Cash on delivery form */}
          {paymentMethod === 'cash' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <View style={styles.cashInfo}>
                <Ionicons name="cash-outline" size={16} color={COLORS.accent} />
                <Text style={styles.cashInfoText}>Pay with cash when your order arrives</Text>
              </View>
              <InputField
                label="Street Address"
                placeholder="123 Street Name"
                value={address}
                onChangeText={setAddress}
              />
              <InputField
                label="City"
                placeholder="Cairo"
                value={city}
                onChangeText={setCity}
              />
              <InputField
                label="Phone Number"
                placeholder="+20 100 000 0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Place order CTA */}
        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[styles.placeOrderBtn, (!canProceed || placing) && { opacity: 0.5 }]}
            onPress={handlePlaceOrder}
            activeOpacity={0.85}
            disabled={!canProceed || placing}
          >
            {placing ? (
              <Text style={styles.placeOrderText}>Placing Order...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.placeOrderText}>
                  Place Order · EGP {safeTotal.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accent },

  scrollContent: { paddingBottom: 20 },

  section: { backgroundColor: COLORS.white, marginTop: 12, paddingHorizontal: 20, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 },

  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderItemTitle: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 8 },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  orderDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  orderTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  orderTotalValue: { fontSize: 17, fontWeight: '900', color: COLORS.accent },

  methodRow: { flexDirection: 'row', gap: 12 },
  methodBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, borderColor: COLORS.accent, backgroundColor: COLORS.white,
  },
  methodBtnActive: { backgroundColor: COLORS.accent },
  methodText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  methodTextActive: { color: COLORS.white },

  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: COLORS.text,
  },
  twoCol: { flexDirection: 'row', gap: 12 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  secureText: { fontSize: 11, color: COLORS.muted },

  cashInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.accentLight, borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  cashInfoText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },

  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  placeOrderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16,
  },
  placeOrderText: { fontSize: 16, fontWeight: '800', color: COLORS.white },

  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
  successSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  successDetails: { width: '100%', backgroundColor: COLORS.card, borderRadius: 16, padding: 18, gap: 12, marginBottom: 28 },
  successRow: { flexDirection: 'row', justifyContent: 'space-between' },
  successLabel: { fontSize: 13, color: COLORS.muted },
  successValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  backToShopBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  backToShopBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});