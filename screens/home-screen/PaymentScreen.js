import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, KeyboardAvoidingView,
  Platform, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { initiateCheckout, placeOrderCOD, getProfile } from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#6abf7b', successLight: '#e8f5e9',
};

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, maxLength, secureTextEntry, style, error }) => (
  <View style={[styles.inputWrap, style]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
    />
    {error ? (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle-outline" size={13} color="#c2185b" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    ) : null}
  </View>
);

export default function PaymentScreen({ navigation, route }) {
  const { items = [], total = 0 } = route?.params || {};
  const safeItems = Array.isArray(items) ? items : [];
  const safeTotal = parseFloat(total) || 0;

  const { getToken } = useAuth();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [errors, setErrors] = useState({});

  const [fullName, setFullName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsLoading, setPointsLoading] = useState(true);

  const POINTS_RATE = 0.1;
  const pointsDiscount = usePoints
    ? Math.min(userPoints * POINTS_RATE, safeTotal * 0.3)
    : 0;
  const finalTotal = Math.max(0, safeTotal - pointsDiscount);
  const pointsToRedeem = usePoints
    ? Math.min(userPoints, Math.ceil(pointsDiscount / POINTS_RATE))
    : 0;

  const isAddressValid = fullName && address && city && phone;
  const canProceed = isAddressValid;

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const profile = await getProfile(token);
        setUserPoints(profile?.points ?? profile?.data?.points ?? 0);
      } catch { }
      finally { setPointsLoading(false); }
    };
    loadPoints();
  }, []);

  // ── Validation ─────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!fullName.trim())
      newErrors.fullName = 'Please enter your full name';
    else if (fullName.trim().length < 3)
      newErrors.fullName = 'Name must be at least 3 characters';

    if (!phone.trim())
      newErrors.phone = 'Please enter a phone number';
    else if (!/^[0-9+\s\-]{7,15}$/.test(phone.trim()))
      newErrors.phone = 'Enter a valid phone number (e.g. 01012345678)';

    if (!address.trim())
      newErrors.address = 'Please enter your street address';
    else if (address.trim().length < 5)
      newErrors.address = 'Address is too short';

    if (!city.trim())
      newErrors.city = 'Please enter your city';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  // ── Place order ────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validate()) return;

    try {
      setPlacing(true);
      const token = await getToken();

      if (paymentMethod === 'cash') {
        const data = await placeOrderCOD(token, {
          fullName, street: address, city, postalCode, phone, instructions,
          pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined,
        });
        setOrderId(data.data?._id ?? data._id ?? null);
        await clearCart();
        setOrderSuccess(true);
      } else {
        const data = await initiateCheckout(token);
        const paymentUrl = data.data?.paymentUrl ?? data.paymentUrl;
        if (!paymentUrl) throw new Error('Payment URL not returned from server.');
        await Linking.openURL(paymentUrl);
        Alert.alert(
          'Redirecting to Payment 🔒',
          'Complete your payment in the browser. Your order will appear in Order History once payment is confirmed.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>
            {paymentMethod === 'cash'
              ? 'Your order is confirmed.\nPay on delivery when your items arrive.'
              : 'Redirected to payment.\nYour order will be confirmed once payment is complete.'}
          </Text>
          <View style={styles.successDetails}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Subtotal</Text>
              <Text style={styles.successValue}>EGP {safeTotal.toFixed(2)}</Text>
            </View>
            {pointsToRedeem > 0 && (
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Points discount</Text>
                <Text style={[styles.successValue, { color: '#388e3c' }]}>
                  − EGP {pointsDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Total paid</Text>
              <Text style={[styles.successValue, { color: COLORS.accent }]}>
                EGP {finalTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Payment</Text>
              <Text style={styles.successValue}>
                {paymentMethod === 'card' ? 'Card (Paymob)' : 'Cash on Delivery'}
              </Text>
            </View>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Items</Text>
              <Text style={styles.successValue}>
                {safeItems.length} item{safeItems.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {orderId && (
              <View style={styles.successRow}>
                <Text style={styles.successLabel}>Order ID</Text>
                <Text style={styles.successValue}>#{orderId.slice(-6).toUpperCase()}</Text>
              </View>
            )}
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

  // ── Address fields — shared between card and COD ───────────────
  const AddressFields = () => (
    <>
      <InputField
        label="Full Name *"
        placeholder="Your full name"
        value={fullName}
        onChangeText={v => { setFullName(v); clearError('fullName'); }}
        error={errors.fullName}
      />
      <InputField
        label="Phone Number *"
        placeholder="+20 100 000 0000"
        value={phone}
        onChangeText={v => { setPhone(v); clearError('phone'); }}
        keyboardType="phone-pad"
        error={errors.phone}
      />
      <InputField
        label="Street Address *"
        placeholder="32 Maadi, Apt 4"
        value={address}
        onChangeText={v => { setAddress(v); clearError('address'); }}
        error={errors.address}
      />
      <View style={styles.rowFields}>
        <InputField
          label="City *"
          placeholder="Cairo"
          value={city}
          onChangeText={v => { setCity(v); clearError('city'); }}
          style={{ flex: 1, marginRight: 8 }}
          error={errors.city}
        />
        <InputField
          label="Postal Code"
          placeholder="11511"
          value={postalCode}
          onChangeText={setPostalCode}
          keyboardType="numeric"
          style={{ flex: 1 }}
        />
      </View>
      <InputField
        label="Additional Instructions (optional)"
        placeholder="e.g. Ring bell 2, leave with doorman…"
        value={instructions}
        onChangeText={setInstructions}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {safeItems.map((item, i) => (
              <View key={item._id ?? i}>
                <View style={styles.orderItem}>
                  <Text style={styles.orderItemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.orderItemPrice}>EGP {item.price}</Text>
                </View>

                {/* ── Offer clarification ── */}
                {item.isAcceptedOffer && (
                  <View style={styles.offerNote}>
                    <Ionicons name="checkmark-circle" size={13} color="#065F46" />
                    <Text style={styles.offerNoteText}>
                      Seller accepted your offer · Original price EGP {item.originalPrice}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            <View style={styles.orderDivider} />
            <View style={styles.orderItem}>
              <Text style={styles.orderSubLabel}>Subtotal</Text>
              <Text style={styles.orderSubValue}>EGP {safeTotal.toFixed(2)}</Text>
            </View>

            {!pointsLoading && userPoints > 0 && (
              <View style={styles.pointsCard}>
                <View style={styles.pointsCardLeft}>
                  <Text style={styles.pointsCardEmoji}>⭐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pointsCardTitle}>Use your {userPoints} points</Text>
                    <Text style={styles.pointsCardSub}>
                      {usePoints
                        ? `Saving EGP ${pointsDiscount.toFixed(2)} on this order`
                        : `Worth up to EGP ${Math.min(userPoints * POINTS_RATE, safeTotal * 0.3).toFixed(2)}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.pointsToggle, usePoints && styles.pointsToggleActive]}
                  onPress={() => setUsePoints(v => !v)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pointsToggleText, usePoints && styles.pointsToggleTextActive]}>
                    {usePoints ? 'Applied ✓' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {usePoints && (
              <View style={styles.orderItem}>
                <Text style={[styles.orderItemTitle, { color: '#388e3c' }]}>Points discount</Text>
                <Text style={[styles.orderItemPrice, { color: '#388e3c' }]}>
                  − EGP {pointsDiscount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.orderDivider, { marginTop: 4 }]} />
            <View style={styles.orderItem}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotalValue}>EGP {finalTotal.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Method */}
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

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card Payment</Text>
              <View style={styles.paymobInfo}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.accent} />
                <Text style={styles.paymobInfoText}>
                  You'll be redirected to Paymob's secure payment page to complete your card payment.
                </Text>
              </View>
              <View style={styles.secureNote}>
                <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.muted} />
                <Text style={styles.secureText}>Secured by Paymob · 256-bit encryption</Text>
              </View>
              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <AddressFields />
              </View>
            </View>
          )}

          {/* Cash on Delivery */}
          {paymentMethod === 'cash' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <View style={styles.cashInfo}>
                <Ionicons name="cash-outline" size={16} color={COLORS.accent} />
                <Text style={styles.cashInfoText}>Pay with cash when your order arrives</Text>
              </View>
              <AddressFields />
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[styles.placeOrderBtn, (!canProceed || placing) && { opacity: 0.5 }]}
            onPress={handlePlaceOrder}
            activeOpacity={0.85}
            disabled={placing}
          >
            {placing
              ? <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
              : <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
            }
            <Text style={styles.placeOrderText}>
              {placing
                ? 'Processing...'
                : paymentMethod === 'card'
                  ? `Pay with Card · EGP ${finalTotal.toFixed(2)}`
                  : `Place Order · EGP ${finalTotal.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  scrollContent: { paddingBottom: 20 },
  section: { backgroundColor: COLORS.white, marginTop: 12, paddingHorizontal: 20, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 14 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderItemTitle: { fontSize: 13, color: COLORS.text, flex: 1, marginRight: 8 },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  orderDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  orderSubLabel: { fontSize: 13, color: COLORS.muted },
  orderSubValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  orderTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  orderTotalValue: { fontSize: 17, fontWeight: '900', color: COLORS.accent },
  pointsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff8e1', borderRadius: 14, padding: 14, marginVertical: 10, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pointsCardEmoji: { fontSize: 22 },
  pointsCardTitle: { fontSize: 13, fontWeight: '700', color: '#2c2c2c' },
  pointsCardSub: { fontSize: 11, color: '#888', marginTop: 2 },
  pointsToggle: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#C17C74', backgroundColor: '#fff' },
  pointsToggleActive: { backgroundColor: '#C17C74', borderColor: '#C17C74' },
  pointsToggleText: { fontSize: 12, fontWeight: '700', color: '#C17C74' },
  pointsToggleTextActive: { color: '#fff' },
  methodRow: { flexDirection: 'row', gap: 12 },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: COLORS.accent, backgroundColor: COLORS.white },
  methodBtnActive: { backgroundColor: COLORS.accent },
  methodText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  methodTextActive: { color: COLORS.white },
  paymobInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 12, padding: 14, marginBottom: 12 },
  paymobInfoText: { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 20 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { fontSize: 11, color: COLORS.muted },
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: COLORS.text },
  inputError: { borderColor: '#c2185b', backgroundColor: '#fce4ec' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText: { fontSize: 11, color: '#c2185b', fontWeight: '600', flex: 1 },
  cashInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accentLight, borderRadius: 12, padding: 12, marginBottom: 16 },
  cashInfoText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  rowFields: { flexDirection: 'row' },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  placeOrderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16 },
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
  offerNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#D1FAE5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    marginBottom: 8,
  },
  offerNoteText: {
    fontSize: 11, color: '#065F46', fontWeight: '600', flex: 1,
  },
});