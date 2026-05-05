import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
};

export default function MainCart({ navigation }) {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const deliveryFee = cartItems.length > 0 ? 25 : 0;
  const grandTotal = total + deliveryFee;

  const handleRemove = (id) => {
    Alert.alert('Remove Item', 'Remove this item from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) },
    ]);
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Add some items first!');
      return;
    }
    navigation.navigate('Payment', { items: cartItems, total: grandTotal });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.headerRight}>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={52} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse the marketplace and add items</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.shopBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionLabel}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</Text>

            {cartItems.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <View style={styles.itemImage}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  ) : (
                    <MaterialCommunityIcons name="hanger" size={30} color={COLORS.accent} />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemBrand}>{item.brand || 'No brand'} · {item.size || 'N/A'}</Text>
                  {item.condition && (
                    <View style={styles.conditionTag}>
                      <Text style={styles.conditionText}>{item.condition}</Text>
                    </View>
                  )}
                  <Text style={styles.itemPrice}>EGP {item.price}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item._id)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#E05C5C" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
                <Text style={styles.summaryValue}>EGP {total.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>EGP {deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Total</Text>
                <Text style={styles.summaryTotalValue}>EGP {grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.ctaBar}>
            <View style={styles.ctaTotalWrap}>
              <Text style={styles.ctaTotalLabel}>Total</Text>
              <Text style={styles.ctaTotalValue}>EGP {grandTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
              <Ionicons name="card-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  headerRight: { width: 40, alignItems: 'flex-end' },
  clearText: { fontSize: 13, color: '#E05C5C', fontWeight: '600' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 28 },
  shopBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  shopBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 14 },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  itemBrand: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  conditionTag: { alignSelf: 'flex-start', backgroundColor: COLORS.accentLight, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },
  conditionText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },
  itemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.accent, marginTop: 6 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdecea', alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: COLORS.muted },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  summaryTotal: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  summaryTotalValue: { fontSize: 16, fontWeight: '900', color: COLORS.accent },
  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  ctaTotalWrap: { flex: 1 },
  ctaTotalLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  ctaTotalValue: { fontSize: 20, fontWeight: '900', color: COLORS.accent },
  checkoutBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16 },
  checkoutBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});