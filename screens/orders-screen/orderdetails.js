import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { cancelOrder } from '../../services/authService';


const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#065F46', successBg: '#D1FAE5',
};

const STEPS = [
  { key: 'pending',           label: 'Order Placed',          icon: '📋' },
  { key: 'courier_dispatched',label: 'Courier Dispatched',    icon: '🔍' },
  { key: 'confirmed',         label: 'Order Confirmed',       icon: '✅' },
  { key: 'sanitizing',        label: 'Sanitization',          icon: '🧴' },
  { key: 'ready',             label: 'Ready for Delivery',    icon: '📦' },
  { key: 'shipped',           label: 'Out for Delivery',      icon: '🚚' },
  { key: 'delivered',         label: 'Delivered',             icon: '🎉' },
];

const STATUS_ORDER = [
  'pending',
  'courier_dispatched',
  'confirmed',
  'sanitizing',
  'ready',
  'shipped',
  'delivered',
];

const STATUS_CONFIG = {
  pending:            { label: 'Pending',             bg: '#FEF3C7', text: '#92400E' },
  courier_dispatched: { label: 'Courier Dispatched',  bg: '#FEF9C3', text: '#713F12' },
  confirmed:          { label: 'Confirmed',            bg: '#DBEAFE', text: '#1E40AF' },
  sanitizing:         { label: 'Sanitizing',           bg: '#FFEDD5', text: '#9A3412' },
  ready:              { label: 'Ready for Delivery',   bg: '#E0F2FE', text: '#075985' },
  shipped:            { label: 'Out for Delivery',     bg: '#EDE9FE', text: '#5B21B6' },
  on_the_way:         { label: 'On the Way',           bg: '#EDE9FE', text: '#5B21B6' },
  delivered:          { label: 'Delivered',            bg: '#D1FAE5', text: '#065F46' },
  cancelled:          { label: 'Cancelled',            bg: '#FEE2E2', text: '#991B1B' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const TrackingTimeline = ({ status }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={20} color="#991B1B" style={{ marginRight: 8 }} />
        <Text style={styles.cancelledText}>This order has been cancelled</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <View key={step.key} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[
                styles.timelineDot,
                isDone && styles.timelineDotDone,
                isCurrent && styles.timelineDotCurrent,
              ]}>
                {isDone && <Ionicons name="checkmark" size={11} color={COLORS.white} />}
              </View>
              {!isLast && (
                <View style={[
                  styles.timelineLine,
                  isDone && index < currentIndex && styles.timelineLineDone,
                ]} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[
                styles.timelineLabel,
                isCurrent && styles.timelineLabelCurrent,
                !isDone && styles.timelineLabelFuture,
              ]}>
                {step.icon}  {step.label}
              </Text>
              {isCurrent && (
                <Text style={styles.timelineCurrentTag}>Current status</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const ProductRow = ({ item }) => (
  <View style={styles.productRow}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.productImage} />
    ) : (
      <View style={[styles.productImage, styles.productImagePlaceholder]}>
        <Text style={{ fontSize: 20 }}>👕</Text>
      </View>
    )}
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>{item.name ?? 'Product'}</Text>
      <Text style={styles.productQty}>Qty: {item.quantity ?? 1}</Text>
    </View>
    <Text style={styles.productPrice}>EGP {item.price ?? 0}</Text>
  </View>
);

export default function OrderDetailScreen({ navigation, route }) {
  const { getToken } = useContext(AuthContext);
  const { order } = route.params;
  const { addToCart } = useCart();

  const status = order.status ?? 'pending';
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const items = order.items ?? [];
  const canCancel = ['pending', 'courier_dispatched'].includes(status);

  const handleReorder = () => {
    Alert.alert('Reorder', 'Add all items from this order to your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reorder',
        onPress: async () => {
          for (const item of items) {
            await addToCart(
              { _id: item.itemId, title: item.name, price: item.price, image: item.image },
              'marketplace'
            );
          }
          Alert.alert('Added to cart!', 'All items have been added to your cart.');
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await cancelOrder(token, order._id);
            Alert.alert(
              'Order Cancelled',
              'Your order has been cancelled successfully.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('../../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={[styles.headerBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.headerBadgeText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Order ID + Date */}
        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaId}>
            Order #{order._id?.toString().slice(-6).toUpperCase() ?? '000000'}
          </Text>
          <Text style={styles.orderMetaDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
        </View>

        {/* Tracking */}
        <View style={styles.card}>
          <SectionTitle title="Order Tracking" />
          <TrackingTimeline status={status} />
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <SectionTitle title="Order Summary" />
          {items.length > 0 ? (
            items.map((item, index) => (
              <View key={index}>
                <ProductRow item={item} />
                {index < items.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items found</Text>
          )}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              EGP {(order.total - 25).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>EGP 25.00</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>EGP {order.total ?? 0}</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.card}>
          <SectionTitle title="Delivery Information" />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {order.address?.street
                ? `${order.address.street}, ${order.address.city}`
                : '—'}
            </Text>
          </View>
          {order.address?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{order.address.phone}</Text>
            </View>
          )}
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <SectionTitle title="Payment" />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Method</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === 'cash_on_delivery'
                ? 'Cash on Delivery'
                : order.paymentMethod === 'card'
                  ? 'Card (Paymob)'
                  : order.paymentMethod ?? '—'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.reorderBtnText}>Reorder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => navigation.navigate('ContactSupportScreen')}
            activeOpacity={0.85}
          >
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: 120, height: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  headerBadgeText: { fontSize: 11, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  orderMeta: { marginBottom: 14 },
  orderMetaId: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  orderMetaDate: { fontSize: 13, color: COLORS.muted, marginTop: 3 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 14 },
  timeline: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 56 },
  timelineLeft: { alignItems: 'center', width: 28, marginRight: 14 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  timelineDotDone: { backgroundColor: COLORS.accent },
  timelineDotCurrent: { backgroundColor: COLORS.accent, borderWidth: 3, borderColor: COLORS.bg, width: 28, height: 28, borderRadius: 14 },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.card, marginVertical: 2 },
  timelineLineDone: { backgroundColor: COLORS.accent },
  timelineContent: { flex: 1, paddingTop: 2, paddingBottom: 16 },
  timelineLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  timelineLabelCurrent: { fontWeight: '700', color: COLORS.accent },
  timelineLabelFuture: { color: COLORS.muted },
  timelineCurrentTag: { fontSize: 11, color: COLORS.accent, marginTop: 3, fontWeight: '600' },
  cancelledBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14 },
  cancelledText: { color: '#991B1B', fontWeight: '600', fontSize: 14 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  productImage: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  productImagePlaceholder: { backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  productQty: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  totalDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 13, color: COLORS.muted },
  totalValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  grandTotalRow: { marginTop: 6 },
  grandTotalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  grandTotalValue: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: 13, color: COLORS.muted, flex: 1 },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 2, textAlign: 'right' },
  actionsCard: { gap: 10, marginBottom: 4 },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, padding: 15 },
  reorderBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 15, borderWidth: 1.5, borderColor: COLORS.accent },
  supportBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: 15 },
  cancelBtn: { borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#C0444A' },
  cancelBtnText: { color: '#C0444A', fontWeight: '600', fontSize: 15 },
  emptyText: { color: COLORS.muted, fontSize: 13, textAlign: 'center', padding: 12 },
});
