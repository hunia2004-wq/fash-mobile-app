import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrders, getSales } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { wp, hp, fp } from '../../utils/responsive';
import { Linking } from 'react-native';


const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  successBg: '#D1FAE5', successText: '#065F46',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmed', bg: '#DBEAFE', text: '#1E40AF' },
  awaiting_pickup: { label: 'Awaiting Pickup', bg: '#FEF3C7', text: '#92400E' },
  courier_dispatched: { label: 'Courier Dispatched', bg: '#EDE9FE', text: '#5B21B6' },
  sanitizing: { label: 'Sanitizing', bg: '#FFEDD5', text: '#9A3412' },
  ready: { label: 'Ready for Delivery', bg: '#E0F2FE', text: '#075985' },
  shipped: { label: 'Shipped', bg: '#EDE9FE', text: '#5B21B6' },
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

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const ActionRequiredBanner = ({ onPress }) => (
  <TouchableOpacity style={styles.actionBanner} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.actionBannerLeft}>
      <View style={styles.actionDot} />
      <View>
        <Text style={styles.actionBannerTitle}>Action required</Text>
        <Text style={styles.actionBannerSub}>Confirm your pickup details</Text>
      </View>
    </View>
    <Ionicons name="arrow-forward-circle" size={wp(22)} color={COLORS.accent} />
  </TouchableOpacity>
);

const PickupScheduledBanner = ({ onPress }) => (
  <TouchableOpacity style={styles.scheduledBanner} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.actionBannerLeft}>
      <Ionicons name="checkmark-circle" size={wp(16)} color="#065F46" style={{ marginRight: wp(8) }} />
      <Text style={styles.scheduledBannerText}>Pickup scheduled — tap to view</Text>
    </View>
    <Ionicons name="chevron-forward" size={wp(16)} color="#065F46" />
  </TouchableOpacity>
);

const BuyingOrderCard = ({ order, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.cardTop}>
      <View>
        <Text style={styles.orderId}>Order #{order.shortId ?? order._id?.toString().slice(-6).toUpperCase() ?? '000000'}</Text>
        <Text style={styles.orderDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
      </View>
      <StatusBadge status={order.status} />
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.cardBottom}>
      <View style={styles.cardStat}>
        <Text style={styles.cardStatLabel}>Items</Text>
        <Text style={styles.cardStatValue}>{order.items?.length ?? 0}</Text>
      </View>
      <View style={styles.cardStatDivider} />
      <View style={styles.cardStat}>
        <Text style={styles.cardStatLabel}>Total</Text>
        <Text style={styles.cardStatValue}>EGP {order.total ?? 0}</Text>
      </View>
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.muted} />
      </View>
    </View>
  </TouchableOpacity>
);

const SellingOrderCard = ({ order, onNavigateToPickup }) => {
  const needsPickup = order.status === 'awaiting_pickup';
  const hasPickup = ['scheduled', 'collected', 'completed'].includes(order.pickup?.status);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>Sale #{order.shortId ?? order._id?.toString().slice(-6).toUpperCase() ?? '000000'}</Text>
          <Text style={styles.orderDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>
      {order.items?.[0]?.name && (
        <Text style={styles.sellingItemName} numberOfLines={1}>
          {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
        </Text>
      )}
      <View style={styles.cardDivider} />
      <View style={styles.cardBottom}>
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Buyer</Text>
          <Text style={styles.cardStatValue}>@{order.buyerUsername ?? '—'}</Text>
        </View>
        <View style={styles.cardStatDivider} />
        <View style={styles.cardStat}>
          <Text style={styles.cardStatLabel}>Sale price</Text>
          <Text style={styles.cardStatValue}>EGP {order.total ?? 0}</Text>
        </View>
      </View>
      {needsPickup && !hasPickup && (
        <ActionRequiredBanner onPress={() => onNavigateToPickup({
          pickupToken: order.pickupToken
        })} />
      )}
      {hasPickup && (
        <PickupScheduledBanner onPress={() => onNavigateToPickup({
          pickupToken: order.pickupToken
        })} />
      )}
    </View>
  );
};

const TabToggle = ({ active, onChange }) => (
  <View style={styles.tabWrapper}>
    <TouchableOpacity style={[styles.tab, active === 'buying' && styles.tabActive]} onPress={() => onChange('buying')} activeOpacity={0.75}>
      <Ionicons name="bag-handle-outline" size={wp(14)} color={active === 'buying' ? COLORS.white : COLORS.accent} style={{ marginRight: wp(5) }} />
      <Text style={[styles.tabText, active === 'buying' && styles.tabTextActive]}>Buying</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.tab, active === 'selling' && styles.tabActive]} onPress={() => onChange('selling')} activeOpacity={0.75}>
      <Ionicons name="storefront-outline" size={wp(14)} color={active === 'selling' ? COLORS.white : COLORS.accent} style={{ marginRight: wp(5) }} />
      <Text style={[styles.tabText, active === 'selling' && styles.tabTextActive]}>Selling</Text>
    </TouchableOpacity>
  </View>
);

const EmptyState = ({ tab, onPress }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{tab === 'buying' ? '📦' : '🏷️'}</Text>
    <Text style={styles.emptyTitle}>{tab === 'buying' ? 'No orders yet' : 'No sales yet'}</Text>
    <Text style={styles.emptySubtitle}>{tab === 'buying' ? "You haven't placed any orders yet" : "Items you sell will appear here"}</Text>
    {tab === 'buying' && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onPress}>
        <Text style={styles.emptyBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    )}
  </View>


);

export default function OrdersScreen({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('buying');
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(useCallback(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true); setError(null);
        const token = await getToken();
        if (!token) return;
        const [ordersData, salesData] = await Promise.all([getOrders(token), getSales(token).catch(() => [])]);
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders ?? []);
        setSales(Array.isArray(salesData) ? salesData : salesData.orders ?? []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []));

  console.log('Sale pickupTokens:', sales.map(s => ({ id: s.shortId, token: s.pickupToken })));


  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [ordersData, salesData] = await Promise.all([
          getOrders(token),
          getSales(token).catch(() => []),
        ]);
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders ?? []);
        setSales(Array.isArray(salesData) ? salesData : salesData.orders ?? []);
      } catch { }
    }, 10000);
    return () => clearInterval(interval);
  }, [getToken]);

  const handleNavigateToPickup = useCallback((params) => {
    if (!params.pickupToken) {
      Alert.alert('Error', 'Pickup link not available for this order.');
      return;
    }
    const url = `https://fash-backend-cp3n.vercel.app/api/v1/pickup/${params.pickupToken}`;
    Linking.openURL(url);
  }, []);

  const listData = activeTab === 'buying' ? orders : sales;

  if (loading) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={COLORS.accent} style={{ flex: 1 }} /></SafeAreaView>;
  }

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
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: wp(40) }} />
      </View>

      <TabToggle active={activeTab} onChange={setActiveTab} />

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load orders.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); setError(null); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : listData.length === 0 ? (
        <EmptyState tab={activeTab} onPress={() => navigation.navigate('Home')} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => activeTab === 'buying' ? (
            <BuyingOrderCard order={item} onPress={() => navigation.navigate('OrderDetailScreen', { order: item })} />
          ) : (
            <SellingOrderCard order={item} onNavigateToPickup={handleNavigateToPickup} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: hp(12) }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: wp(120), height: hp(50) },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  navBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fp(20), fontWeight: '700', color: COLORS.accent },
  tabWrapper: { flexDirection: 'row', marginHorizontal: wp(16), marginBottom: hp(16), backgroundColor: COLORS.card, borderRadius: wp(14), padding: wp(4) },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: hp(9), borderRadius: wp(11) },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { fontSize: fp(13), fontWeight: '600', color: COLORS.accent },
  tabTextActive: { color: COLORS.white },
  listContent: { paddingHorizontal: wp(16), paddingBottom: hp(32) },
  card: { backgroundColor: COLORS.white, borderRadius: wp(16), padding: wp(16), borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: fp(14), fontWeight: '700', color: COLORS.text },
  orderDate: { fontSize: fp(12), color: COLORS.muted, marginTop: hp(3) },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: hp(12) },
  cardBottom: { flexDirection: 'row', alignItems: 'center' },
  cardStat: { flex: 1 },
  cardStatLabel: { fontSize: fp(11), color: COLORS.muted, marginBottom: hp(2) },
  cardStatValue: { fontSize: fp(14), fontWeight: '600', color: COLORS.text },
  cardStatDivider: { width: StyleSheet.hairlineWidth, height: hp(28), backgroundColor: COLORS.border, marginHorizontal: wp(16) },
  cardArrow: { marginLeft: 'auto', paddingLeft: wp(12) },
  sellingItemName: { fontSize: fp(13), color: COLORS.muted, marginTop: hp(4), marginBottom: hp(2) },
  actionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: hp(12), backgroundColor: COLORS.accentLight, borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: hp(10), borderWidth: 1, borderColor: 'rgba(193,124,116,0.3)' },
  actionBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  actionDot: { width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: COLORS.accent, marginRight: wp(10) },
  actionBannerTitle: { fontSize: fp(13), fontWeight: '700', color: COLORS.accent },
  actionBannerSub: { fontSize: fp(11), color: COLORS.muted, marginTop: hp(1) },
  scheduledBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: hp(12), backgroundColor: COLORS.successBg, borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: hp(10), borderWidth: 1, borderColor: '#A7F3D0' },
  scheduledBannerText: { fontSize: fp(12), fontWeight: '600', color: COLORS.successText },
  badge: { paddingHorizontal: wp(10), paddingVertical: hp(4), borderRadius: wp(20) },
  badgeText: { fontSize: fp(11), fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(40) },
  emptyIcon: { fontSize: fp(56), marginBottom: hp(16) },
  emptyTitle: { fontSize: fp(20), fontWeight: '700', color: COLORS.text, marginBottom: hp(8) },
  emptySubtitle: { fontSize: fp(14), color: COLORS.muted, textAlign: 'center', marginBottom: hp(28), lineHeight: hp(20) },
  emptyBtn: { backgroundColor: COLORS.accent, paddingHorizontal: wp(32), paddingVertical: hp(12), borderRadius: wp(20) },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: fp(14) },
  errorText: { color: COLORS.muted, fontSize: fp(14), marginBottom: hp(12) },
  retryText: { color: COLORS.accent, fontWeight: '600', fontSize: fp(14) },
});