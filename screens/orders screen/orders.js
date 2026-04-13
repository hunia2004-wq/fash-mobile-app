import React, { useContext, useEffect, useState } from "react";
import {View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions,} from "react-native";
import { getOrders } from "../../services/authService";
import { AuthContext } from '../../context/authcontext';


const { width } = Dimensions.get("window");

const STATUS_CONFIG = {
  pending:     { label: "Pending",      bg: "#FEF3C7", text: "#92400E" },
  confirmed:   { label: "Confirmed",    bg: "#DBEAFE", text: "#1E40AF" },
  preparing:   { label: "Preparing",    bg: "#FFEDD5", text: "#9A3412" },
  on_the_way:  { label: "On the Way",   bg: "#EDE9FE", text: "#5B21B6" },
  delivered:   { label: "Delivered",    bg: "#D1FAE5", text: "#065F46" },
  cancelled:   { label: "Cancelled",    bg: "#FEE2E2", text: "#991B1B" },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const OrderCard = ({ order, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.cardTop}>
      <View>
        <Text style={styles.orderId}>Order #{order.id?.toString().slice(-6) || "000000"}</Text>
        <Text style={styles.orderDate}>{order.date || order.created_at || "—"}</Text>
      </View>
      <StatusBadge status={order.status} />
    </View>

    <View style={styles.cardDivider} />

    <View style={styles.cardBottom}>
      <View style={styles.cardStat}>
        <Text style={styles.cardStatLabel}>Items</Text>
        <Text style={styles.cardStatValue}>{order.items?.length || order.items_count || 0}</Text>
      </View>
      <View style={styles.cardStatDivider} />
      <View style={styles.cardStat}>
        <Text style={styles.cardStatLabel}>Total</Text>
        <Text style={styles.cardStatValue}>
          {order.currency || "EGP"} {order.total || order.total_price || "0"}
        </Text>
      </View>
      <View style={styles.cardArrow}>
        <Text style={styles.cardArrowText}>›</Text>
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getOrders(token);
        // handle both { orders: [] } and direct array response
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (e) {
        console.warn("Failed to fetch orders:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C17C74" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 28 }} />
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load orders.</Text>
          <TouchableOpacity onPress={() => { setLoading(true); setError(null); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <EmptyState onPress={() => navigation.navigate("Home")} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate("OrderDetailScreen", { order: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDE6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backBtn: {
    fontSize: 28,
    color: "#8B5A5A",
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C1F1F",
  },

  // ── List ──
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Card ──
  card: {
    backgroundColor: "#EDE0D8",
    borderRadius: 16,
    padding: 16,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C1F1F",
  },
  orderDate: {
    fontSize: 12,
    color: "#7A6060",
    marginTop: 3,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(140,100,100,0.2)",
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardStat: {
    flex: 1,
  },
  cardStatLabel: {
    fontSize: 11,
    color: "#7A6060",
    marginBottom: 2,
  },
  cardStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1F1F",
  },
  cardStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(140,100,100,0.2)",
    marginHorizontal: 16,
  },
  cardArrow: {
    marginLeft: "auto",
    paddingLeft: 12,
  },
  cardArrowText: {
    fontSize: 22,
    color: "#B09090",
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C1F1F",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7A6060",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: "#C17C74",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Error ──
  errorText: {
    color: "#7A6060",
    fontSize: 14,
    marginBottom: 12,
  },
  retryText: {
    color: "#C17C74",
    fontWeight: "600",
    fontSize: 14,
  },
});