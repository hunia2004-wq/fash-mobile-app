import React, { useContext, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { cancelOrder, getOrders } from '../../services/authService';
import { wp, hp, fp } from '../../utils/responsive';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#065F46', successBg: '#D1FAE5',
};

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'awaiting_pickup', label: 'Awaiting Pickup', icon: '📍' },
  { key: 'courier_dispatched', label: 'Courier Dispatched', icon: '🔍' },
  { key: 'confirmed', label: 'Order Confirmed', icon: '✅' },
  { key: 'sanitizing', label: 'Sanitization', icon: '🧴' },
  { key: 'ready', label: 'Ready for Delivery', icon: '📦' },
  { key: 'shipped', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

const STATUS_ORDER = ['pending', 'awaiting_pickup', 'courier_dispatched', 'confirmed', 'sanitizing', 'ready', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  courier_dispatched: { label: 'Courier Dispatched', bg: '#FEF9C3', text: '#713F12' },
  confirmed: { label: 'Confirmed', bg: '#DBEAFE', text: '#1E40AF' },
  sanitizing: { label: 'Sanitizing', bg: '#FFEDD5', text: '#9A3412' },
  ready: { label: 'Ready for Delivery', bg: '#E0F2FE', text: '#075985' },
  shipped: { label: 'Out for Delivery', bg: '#EDE9FE', text: '#5B21B6' },
  on_the_way: { label: 'On the Way', bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { label: 'Delivered', bg: '#D1FAE5', text: '#065F46' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
  rejected: { label: 'Item Rejected', bg: '#FEE2E2', text: '#991B1B' },
  rejection_pending: { label: 'Return in Progress', bg: '#FFEDD5', text: '#9A3412' },
  refunded: { label: 'Refunded', bg: '#D1FAE5', text: '#065F46' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const SectionTitle = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;

const TrackingTimeline = ({ status, rejectionReason }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === 'cancelled';
  const isRejected = ['rejected', 'rejection_pending', 'refunded'].includes(status);

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={wp(20)} color="#991B1B" style={{ marginRight: wp(8) }} />
        <Text style={styles.cancelledText}>This order has been cancelled</Text>
      </View>
    );
  }

  if (isRejected) {
    return (
      <View>
        <View style={styles.timeline}>
          {STEPS.slice(0, 4).map((step) => (
            <View key={step.key} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, styles.timelineDotDone]}>
                  <Ionicons name="checkmark" size={wp(11)} color={COLORS.white} />
                </View>
                <View style={[styles.timelineLine, styles.timelineLineDone]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>{step.icon}  {step.label}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.rejectedBox}>
          <View style={styles.rejectedHeader}>
            <Ionicons name="close-circle" size={wp(20)} color="#991B1B" style={{ marginRight: wp(8) }} />
            <Text style={styles.rejectedTitle}>Item Rejected</Text>
          </View>
          {rejectionReason && <Text style={styles.rejectedReason}>Reason: {rejectionReason}</Text>}
          <View style={styles.rejectedSteps}>
            <Text style={[styles.rejectedStep, status === 'rejection_pending' && styles.rejectedStepActive, status === 'refunded' && styles.rejectedStepDone]}>🔄  Return in Progress</Text>
            <Text style={[styles.rejectedStep, status === 'refunded' && styles.rejectedStepActive]}>💰  Refunded</Text>
          </View>
        </View>
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
              <View style={[styles.timelineDot, isDone && styles.timelineDotDone, isCurrent && styles.timelineDotCurrent]}>
                {isDone && <Ionicons name="checkmark" size={wp(11)} color={COLORS.white} />}
              </View>
              {!isLast && <View style={[styles.timelineLine, isDone && index < currentIndex && styles.timelineLineDone]} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelCurrent, !isDone && styles.timelineLabelFuture]}>
                {step.icon}  {step.label}
              </Text>
              {isCurrent && <Text style={styles.timelineCurrentTag}>Current status</Text>}
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
        <Text style={{ fontSize: wp(20) }}>👕</Text>
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
  const { addToCart } = useCart();

  const [currentOrder, setCurrentOrder] = useState(route.params.order);

  const status = currentOrder.status ?? 'pending';
  const statusConfig = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const items = currentOrder.items ?? [];
  const canCancel = ['pending', 'awaiting_pickup', 'courier_dispatched'].includes(status);

  const handleReorder = () => {
    Alert.alert('Reorder', 'Add all items from this order to your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reorder', onPress: async () => {
          for (const item of items) {
            await addToCart({ _id: item.itemId, title: item.name, price: item.price, image: item.image }, 'marketplace');
          }
          Alert.alert('Added to cart!', 'All items have been added to your cart.');
        }
      },
    ]);
  };


  useFocusEffect(useCallback(() => {
    const poll = async () => {
      try {
        const token = await getToken();
        const orders = await getOrders(token);
        const fresh = orders.find(o => o._id.toString() === currentOrder._id.toString());
        if (fresh) setCurrentOrder(fresh);
      } catch { }
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []));


  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken();
            await cancelOrder(token, currentOrder._id);
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
          } catch (err) { Alert.alert('Error', err.message); }
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={[styles.headerBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.headerBadgeText, { color: statusConfig.text }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaId}>Order #{currentOrder._id?.toString().slice(-6).toUpperCase() ?? '000000'}</Text>
          <Text style={styles.orderMetaDate}>{formatDate(currentOrder.placedAt ?? currentOrder.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <SectionTitle title="Order Tracking" />
          <TrackingTimeline status={status} rejectionReason={currentOrder.rejectionReason} />
        </View>

        <View style={styles.card}>
          <SectionTitle title="Order Summary" />
          {items.length > 0 ? items.map((item, index) => (
            <View key={index}>
              <ProductRow item={item} />
              {index < items.length - 1 && <View style={styles.rowDivider} />}
            </View>
          )) : <Text style={styles.emptyText}>No items found</Text>}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>EGP {(currentOrder.total - 25).toFixed(2)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Delivery Fee</Text><Text style={styles.totalValue}>EGP 25.00</Text></View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>EGP {currentOrder.total ?? 0}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <SectionTitle title="Delivery Information" />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{currentOrder.address?.street ? `${currentOrder.address.street}, ${currentOrder.address.city}` : '—'}</Text>
          </View>
          {currentOrder.address?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{currentOrder.address.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <SectionTitle title="Payment" />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Method</Text>
            <Text style={styles.infoValue}>{currentOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : currentOrder.paymentMethod === 'card' ? 'Card (Paymob)' : currentOrder.paymentMethod ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={wp(16)} color={COLORS.white} style={{ marginRight: wp(8) }} />
            <Text style={styles.reorderBtnText}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportBtn} onPress={() => navigation.navigate('ContactSupportScreen')} activeOpacity={0.85}>
            <Ionicons name="chatbubble-outline" size={wp(16)} color={COLORS.accent} style={{ marginRight: wp(8) }} />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: hp(32) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: wp(120), height: hp(50) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  navBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fp(20), fontWeight: '700', color: COLORS.accent },
  headerBadge: { paddingHorizontal: wp(10), paddingVertical: hp(4), borderRadius: wp(20) },
  headerBadgeText: { fontSize: fp(11), fontWeight: '700' },
  scrollContent: { padding: wp(16), paddingBottom: hp(32) },
  orderMeta: { marginBottom: hp(14) },
  orderMetaId: { fontSize: fp(18), fontWeight: '700', color: COLORS.text },
  orderMetaDate: { fontSize: fp(13), color: COLORS.muted, marginTop: hp(3) },
  card: { backgroundColor: COLORS.white, borderRadius: wp(16), padding: wp(16), marginBottom: hp(14), borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: fp(11), fontWeight: '700', color: COLORS.accent, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: hp(14) },
  timeline: { paddingLeft: wp(4) },
  timelineRow: { flexDirection: 'row', minHeight: hp(56) },
  timelineLeft: { alignItems: 'center', width: wp(28), marginRight: wp(14) },
  timelineDot: { width: wp(24), height: wp(24), borderRadius: wp(12), backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  timelineDotDone: { backgroundColor: COLORS.accent },
  timelineDotCurrent: { backgroundColor: COLORS.accent, borderWidth: 3, borderColor: COLORS.bg, width: wp(28), height: wp(28), borderRadius: wp(14) },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.card, marginVertical: 2 },
  timelineLineDone: { backgroundColor: COLORS.accent },
  timelineContent: { flex: 1, paddingTop: hp(2), paddingBottom: hp(16) },
  timelineLabel: { fontSize: fp(14), fontWeight: '500', color: COLORS.text },
  timelineLabelCurrent: { fontWeight: '700', color: COLORS.accent },
  timelineLabelFuture: { color: COLORS.muted },
  timelineCurrentTag: { fontSize: fp(11), color: COLORS.accent, marginTop: hp(3), fontWeight: '600' },
  cancelledBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: wp(10), padding: wp(14) },
  cancelledText: { color: '#991B1B', fontWeight: '600', fontSize: fp(14) },
  rejectedBox: { backgroundColor: '#FEF2F2', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: '#FECACA', marginTop: hp(4) },
  rejectedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(6) },
  rejectedTitle: { fontSize: fp(14), fontWeight: '700', color: '#991B1B' },
  rejectedReason: { fontSize: fp(12), color: '#B91C1C', marginBottom: hp(10), marginLeft: wp(4) },
  rejectedSteps: { gap: hp(8), marginTop: hp(4) },
  rejectedStep: { fontSize: fp(13), color: COLORS.muted, fontWeight: '500' },
  rejectedStepActive: { color: '#9A3412', fontWeight: '700' },
  rejectedStepDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: hp(10) },
  productImage: { width: wp(56), height: wp(56), borderRadius: wp(10), marginRight: wp(12) },
  productImagePlaceholder: { backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: fp(14), fontWeight: '600', color: COLORS.text },
  productQty: { fontSize: fp(12), color: COLORS.muted, marginTop: hp(3) },
  productPrice: { fontSize: fp(14), fontWeight: '700', color: COLORS.text, marginLeft: wp(8) },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  totalDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: hp(12) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: hp(4) },
  totalLabel: { fontSize: fp(13), color: COLORS.muted },
  totalValue: { fontSize: fp(13), color: COLORS.text, fontWeight: '500' },
  grandTotalRow: { marginTop: hp(6) },
  grandTotalLabel: { fontSize: fp(15), fontWeight: '700', color: COLORS.text },
  grandTotalValue: { fontSize: fp(15), fontWeight: '700', color: COLORS.accent },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: hp(9), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: fp(13), color: COLORS.muted, flex: 1 },
  infoValue: { fontSize: fp(13), color: COLORS.text, fontWeight: '500', flex: 2, textAlign: 'right' },
  actionsCard: { gap: hp(10), marginBottom: hp(4) },
  reorderBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: wp(14), padding: hp(15) },
  reorderBtnText: { color: COLORS.white, fontWeight: '700', fontSize: fp(15) },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: wp(14), padding: hp(15), borderWidth: 1.5, borderColor: COLORS.accent },
  supportBtnText: { color: COLORS.accent, fontWeight: '600', fontSize: fp(15) },
  cancelBtn: { borderRadius: wp(14), padding: hp(15), alignItems: 'center', borderWidth: 1.5, borderColor: '#C0444A' },
  cancelBtnText: { color: '#C0444A', fontWeight: '600', fontSize: fp(15) },
  emptyText: { color: COLORS.muted, fontSize: fp(13), textAlign: 'center', padding: wp(12) },
});