import React, { useContext, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrders, getSales } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  successBg: '#D1FAE5', successText: '#065F46',
  warningBg: '#FEF3C7', warningText: '#92400E',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmed', bg: '#DBEAFE', text: '#1E40AF' },
  preparing: { label: 'Preparing', bg: '#FFEDD5', text: '#9A3412' },
  shipped: { label: 'Shipped', bg: '#EDE9FE', text: '#5B21B6' },
  on_the_way: { label: 'On the Way', bg: '#EDE9FE', text: '#5B21B6' },
  delivered: { label: 'Delivered', bg: '#D1FAE5', text: '#065F46' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: '#991B1B' },
  cash_on_delivery: { label: 'Cash on Delivery', bg: '#FEF3C7', text: '#92400E' },
  // ── Seller-side statuses ──
  awaiting_pickup: { label: 'Awaiting Pickup', bg: '#FEF3C7', text: '#92400E' },
  courier_dispatched: { label: 'Courier Dispatched', bg: '#EDE9FE', text: '#5B21B6' },
  item_verified: { label: 'Item Verified', bg: '#D1FAE5', text: '#065F46' },
  item_rejected: { label: 'Item Rejected', bg: '#FEE2E2', text: '#991B1B' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

// The orange "Action required" banner shown on seller cards that need pickup info
const ActionRequiredBanner = ({ onPress }) => (
  <TouchableOpacity style={styles.actionBanner} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.actionBannerLeft}>
      <View style={styles.actionDot} />
      <View>
        <Text style={styles.actionBannerTitle}>Action required</Text>
        <Text style={styles.actionBannerSub}>Confirm your pickup details</Text>
      </View>
    </View>
    <Ionicons name="arrow-forward-circle" size={22} color={COLORS.accent} />
  </TouchableOpacity>
);

// Green "Pickup scheduled" read-only entry
const PickupScheduledBanner = ({ onPress }) => (
  <TouchableOpacity style={styles.scheduledBanner} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.actionBannerLeft}>
      <Ionicons name="checkmark-circle" size={16} color="#065F46" style={{ marginRight: 8 }} />
      <Text style={styles.scheduledBannerText}>Pickup scheduled — tap to view</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#065F46" />
  </TouchableOpacity>
);

// Buying order card (unchanged from your original)
const BuyingOrderCard = ({ order, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.cardTop}>
      <View>
        <Text style={styles.orderId}>
          Order #{order._id?.toString().slice(-6).toUpperCase() ?? '000000'}
        </Text>
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
        <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
      </View>
    </View>
  </TouchableOpacity>
);

// Selling order card — shows pickup banner based on status
const SellingOrderCard = ({ order, onNavigateToPickup }) => {
  const needsPickup = order.status === 'awaiting_pickup';
  const hasPickup = order.pickup?.status === 'scheduled' || 
                  order.pickup?.status === 'collected' || 
                  order.pickup?.status === 'completed';

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>
            Sale #{order._id?.toString().slice(-6).toUpperCase() ?? '000000'}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.placedAt ?? order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Item name */}
      {order.items?.[0]?.name && (
        <Text style={styles.sellingItemName} numberOfLines={1}>
          {order.items[0].name}
          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
        </Text>
      )}

      <View style={styles.cardDivider} />

      {/* Price row */}
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

      {/* ── Pickup banners ── */}
      {needsPickup && !hasPickup && (
        <ActionRequiredBanner
          onPress={() =>
            onNavigateToPickup({
              orderId: order._id?.toString().toUpperCase(),
              item: {
                name: order.items?.[0]?.name ?? 'Item',
                price: order.total ?? 0,
                imageUrl: order.items?.[0]?.imageUrl ?? null,
              },
              buyerUsername: order.buyerUsername ?? 'buyer',
              readOnly: false,
            })
          }
        />
      )}

      {hasPickup && (
        <PickupScheduledBanner
          onPress={() =>
            onNavigateToPickup({
              orderId: order._id?.toString().toUpperCase(),
              item: {
                name: order.items?.[0]?.name ?? 'Item',
                price: order.total ?? 0,
                imageUrl: order.items?.[0]?.imageUrl ?? null,
              },
              buyerUsername: order.buyerUsername ?? 'buyer',
              readOnly: true,
            })
          }
        />
      )}
    </View>
  );
};

// Tab toggle component
const TabToggle = ({ active, onChange }) => (
  <View style={styles.tabWrapper}>
    <TouchableOpacity
      style={[styles.tab, active === 'buying' && styles.tabActive]}
      onPress={() => onChange('buying')}
      activeOpacity={0.75}
    >
      <Ionicons
        name="bag-handle-outline"
        size={14}
        color={active === 'buying' ? COLORS.white : COLORS.accent}
        style={{ marginRight: 5 }}
      />
      <Text style={[styles.tabText, active === 'buying' && styles.tabTextActive]}>
        Buying
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.tab, active === 'selling' && styles.tabActive]}
      onPress={() => onChange('selling')}
      activeOpacity={0.75}
    >
      <Ionicons
        name="storefront-outline"
        size={14}
        color={active === 'selling' ? COLORS.white : COLORS.accent}
        style={{ marginRight: 5 }}
      />
      <Text style={[styles.tabText, active === 'selling' && styles.tabTextActive]}>
        Selling
      </Text>
    </TouchableOpacity>
  </View>
);

const EmptyState = ({ tab, onPress }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{tab === 'buying' ? '📦' : '🏷️'}</Text>
    <Text style={styles.emptyTitle}>
      {tab === 'buying' ? 'No orders yet' : 'No sales yet'}
    </Text>
    <Text style={styles.emptySubtitle}>
      {tab === 'buying'
        ? "You haven't placed any orders yet"
        : "Items you sell will appear here"}
    </Text>
    {tab === 'buying' && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onPress}>
        <Text style={styles.emptyBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrdersScreen({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('buying');
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const token = await getToken();
          if (!token) return;
  
          const [ordersData, salesData] = await Promise.all([
            getOrders(token),
            getSales(token).catch(() => []),
          ]);
  
          setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders ?? []);
          setSales(Array.isArray(salesData)   ? salesData  : salesData.orders  ?? []);
        } catch (e) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();   
    }, [])
  );

  const handleNavigateToPickup = useCallback((params) => {
    navigation.navigate('SellerPickupScreen', params);
  }, [navigation]);

  const listData = activeTab === 'buying' ? orders : sales;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />

        <TouchableOpacity onPress={() => navigation.navigate('SellerPickupScreen')}><Text>try here</Text></TouchableOpacity>
      </View>

      {/* ── Tab toggle ── */}
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
          renderItem={({ item }) =>
            activeTab === 'buying' ? (
              <BuyingOrderCard
                order={item}
                onPress={() => navigation.navigate('OrderDetailScreen', { order: item })}
              />
            ) : (
              <SellingOrderCard
                order={item}
                onNavigateToPickup={handleNavigateToPickup}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoHeader: { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: 120, height: 50 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },

  // Tab toggle
  tabWrapper: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    fontSize: 13, fontWeight: '600', color: COLORS.accent,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Shared card
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  orderDate: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center' },
  cardStat: { flex: 1 },
  cardStatLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  cardStatValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardStatDivider: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: COLORS.border, marginHorizontal: 16 },
  cardArrow: { marginLeft: 'auto', paddingLeft: 12 },

  // Selling card extras
  sellingItemName: {
    fontSize: 13, color: COLORS.muted, marginTop: 4, marginBottom: 2,
  },

  // Action required banner
  actionBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12,
    backgroundColor: COLORS.accentLight,
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(193,124,116,0.3)',
  },
  actionBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  actionDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 10,
  },
  actionBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  actionBannerSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },

  // Scheduled banner
  scheduledBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12,
    backgroundColor: COLORS.successBg,
    borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  scheduledBannerText: { fontSize: 12, fontWeight: '600', color: COLORS.successText },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  emptyBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 20 },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  errorText: { color: COLORS.muted, fontSize: 14, marginBottom: 12 },
  retryText: { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});