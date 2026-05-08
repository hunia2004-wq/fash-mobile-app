import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrders } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
};

const STATUS_CONFIG = {
  pending:          { label: 'Pending',        bg: '#FEF3C7', text: '#92400E' },
  confirmed:        { label: 'Confirmed',       bg: '#DBEAFE', text: '#1E40AF' },
  preparing:        { label: 'Preparing',       bg: '#FFEDD5', text: '#9A3412' },
  shipped:          { label: 'Shipped',         bg: '#EDE9FE', text: '#5B21B6' },
  on_the_way:       { label: 'On the Way',      bg: '#EDE9FE', text: '#5B21B6' },
  delivered:        { label: 'Delivered',       bg: '#D1FAE5', text: '#065F46' },
  cancelled:        { label: 'Cancelled',       bg: '#FEE2E2', text: '#991B1B' },
  cash_on_delivery: { label: 'Cash on Delivery',bg: '#FEF3C7', text: '#92400E' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const OrderCard = ({ order, onPress }) => (
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

const EmptyState = ({ onPress }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📦</Text>
    <Text style={styles.emptyTitle}>No orders yet</Text>
    <Text style={styles.emptySubtitle}>You haven't placed any orders yet</Text>
    <TouchableOpacity style={styles.emptyBtn} onPress={onPress}>
      <Text style={styles.emptyBtnText}>Start Shopping</Text>
    </TouchableOpacity>
  </View>
);

export default function OrdersScreen({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getOrders(token);
        setOrders(Array.isArray(data) ? data : data.orders ?? []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load orders.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); setError(null); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <EmptyState onPress={() => navigation.navigate('Home')} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id?.toString() ?? Math.random().toString()}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('OrderDetailScreen', { order: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: COLORS.bg },
  centered:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoHeader:       { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo:             { width: 120, height: 50 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  navBtn:           { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  listContent:      { padding: 16, paddingBottom: 32 },
  card:             { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId:          { fontSize: 14, fontWeight: '700', color: COLORS.text },
  orderDate:        { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  cardDivider:      { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border, marginVertical: 12 },
  cardBottom:       { flexDirection: 'row', alignItems: 'center' },
  cardStat:         { flex: 1 },
  cardStatLabel:    { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  cardStatValue:    { fontSize: 14, fontWeight: '600', color: COLORS.text },
  cardStatDivider:  { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: COLORS.border, marginHorizontal: 16 },
  cardArrow:        { marginLeft: 'auto', paddingLeft: 12 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:        { fontSize: 11, fontWeight: '700' },
  emptyContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIcon:        { fontSize: 56, marginBottom: 16 },
  emptyTitle:       { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle:    { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  emptyBtn:         { backgroundColor: COLORS.accent, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 20 },
  emptyBtnText:     { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  errorText:        { color: COLORS.muted, fontSize: 14, marginBottom: 12 },
  retryText:        { color: COLORS.accent, fontWeight: '600', fontSize: 14 },
});