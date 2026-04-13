import React, { useContext } from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions,} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

// ── Tracking steps ───────────────────────────────────
const STEPS = [
  { key: "pending",     label: "Order Placed",      icon: "📋" },
  { key: "confirmed",   label: "Confirmed",          icon: "✅" },
  { key: "preparing",   label: "Preparing",          icon: "👨‍🍳" },
  { key: "on_the_way",  label: "Out for Delivery",   icon: "🚚" },
  { key: "delivered",   label: "Delivered",          icon: "🎉" },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "on_the_way", "delivered"];

const STATUS_CONFIG = {
  pending:     { label: "Pending",      bg: "#FEF3C7", text: "#92400E" },
  confirmed:   { label: "Confirmed",    bg: "#DBEAFE", text: "#1E40AF" },
  preparing:   { label: "Preparing",    bg: "#FFEDD5", text: "#9A3412" },
  on_the_way:  { label: "On the Way",   bg: "#EDE9FE", text: "#5B21B6" },
  delivered:   { label: "Delivered",    bg: "#D1FAE5", text: "#065F46" },
  cancelled:   { label: "Cancelled",    bg: "#FEE2E2", text: "#991B1B" },
};

// ── Sub-components ───────────────────────────────────

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const TrackingTimeline = ({ status }) => {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledText}>❌  This order has been cancelled</Text>
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
            {/* Left — dot + line */}
            <View style={styles.timelineLeft}>
              <View style={[
                styles.timelineDot,
                isDone && styles.timelineDotDone,
                isCurrent && styles.timelineDotCurrent,
              ]}>
                {isDone && <Text style={styles.timelineDotIcon}>✓</Text>}
              </View>
              {!isLast && (
                <View style={[
                  styles.timelineLine,
                  isDone && index < currentIndex && styles.timelineLineDone,
                ]} />
              )}
            </View>

            {/* Right — label */}
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
      <Text style={styles.productName} numberOfLines={2}>
        {item.name || item.product_name || "Product"}
      </Text>
      <Text style={styles.productQty}>Qty: {item.quantity || 1}</Text>
    </View>
    <Text style={styles.productPrice}>
      {item.currency || "EGP"} {item.price || item.total_price || "0"}
    </Text>
  </View>
);

// ── Main Screen ──────────────────────────────────────

export default function OrderDetailScreen({ navigation, route }) {
  const { getToken } = useContext(AuthContext);
  const { order } = route.params;

  const status = order.status || "pending";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const items = order.items || [];
  const canCancel = ["pending", "confirmed"].includes(status);

  const handleReorder = () => {
    Alert.alert("Reorder", "Add all items from this order to your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reorder", onPress: () => {
        // TODO: implement reorder logic
        Alert.alert("Added to cart!", "All items have been added to your cart.");
      }},
    ]);
  };

  const handleCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes, Cancel", style: "destructive", onPress: () => {
        // TODO: call cancel order API
        navigation.goBack();
      }},
    ]);
  };

  const handleContactSupport = () => {
    navigation.navigate("ContactSupportScreen");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={[styles.headerBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.headerBadgeText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID + Date */}
        <View style={styles.orderMeta}>
          <Text style={styles.orderMetaId}>
            Order #{order.id?.toString().slice(-6) || "000000"}
          </Text>
          <Text style={styles.orderMetaDate}>
            {order.date || order.created_at || "—"}
          </Text>
        </View>

        {/* ── 1. Tracking Timeline ── */}
        <View style={styles.card}>
          <SectionTitle title="Order Tracking" />
          <TrackingTimeline status={status} />
        </View>

        {/* ── 2. Order Summary ── */}
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
              {order.currency || "EGP"} {order.subtotal || order.total || "0"}
            </Text>
          </View>
          {order.delivery_fee !== undefined && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>
                {order.currency || "EGP"} {order.delivery_fee}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {order.currency || "EGP"} {order.total || order.total_price || "0"}
            </Text>
          </View>
        </View>

        {/* ── 3. Delivery Information ── */}
        <View style={styles.card}>
          <SectionTitle title="Delivery Information" />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {order.address || order.delivery_address || "—"}
            </Text>
          </View>
          {order.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{order.phone}</Text>
            </View>
          )}
          {order.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
          {order.estimated_delivery && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated</Text>
              <Text style={[styles.infoValue, { color: "#C17C74", fontWeight: "700" }]}>
                {order.estimated_delivery}
              </Text>
            </View>
          )}
        </View>

        {/* ── 4. Payment Information ── */}
        <View style={styles.card}>
          <SectionTitle title="Payment" />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Method</Text>
            <Text style={styles.infoValue}>
              {order.payment_method || "Cash on Delivery"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[
              styles.paymentBadge,
              {
                backgroundColor: order.payment_status === "paid"
                  ? "#D1FAE5" : "#FEF3C7",
              },
            ]}>
              <Text style={[
                styles.paymentBadgeText,
                {
                  color: order.payment_status === "paid"
                    ? "#065F46" : "#92400E",
                },
              ]}>
                {order.payment_status === "paid" ? "✓ Paid" : "Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 5. Actions ── */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.reorderBtn} onPress={handleReorder}>
            <Text style={styles.reorderBtnText}>🔄  Reorder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportBtn} onPress={handleContactSupport}>
            <Text style={styles.supportBtnText}>💬  Contact Support</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDE6",
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
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Scroll ──
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // ── Order Meta ──
  orderMeta: {
    marginBottom: 14,
  },
  orderMetaId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C1F1F",
  },
  orderMetaDate: {
    fontSize: 13,
    color: "#7A6060",
    marginTop: 3,
  },

  // ── Card ──
  card: {
    backgroundColor: "#EDE0D8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A6060",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // ── Timeline ──
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: "center",
    width: 28,
    marginRight: 14,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D5C0B8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineDotDone: {
    backgroundColor: "#C17C74",
  },
  timelineDotCurrent: {
    backgroundColor: "#C17C74",
    borderWidth: 3,
    borderColor: "#F5EDE6",
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  timelineDotIcon: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#D5C0B8",
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: "#C17C74",
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C1F1F",
  },
  timelineLabelCurrent: {
    fontWeight: "700",
    color: "#C17C74",
  },
  timelineLabelFuture: {
    color: "#B09090",
  },
  timelineCurrentTag: {
    fontSize: 11,
    color: "#C17C74",
    marginTop: 3,
    fontWeight: "600",
  },
  cancelledBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  cancelledText: {
    color: "#991B1B",
    fontWeight: "600",
    fontSize: 14,
  },

  // ── Products ──
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  productImagePlaceholder: {
    backgroundColor: "#D5C0B8",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C1F1F",
  },
  productQty: {
    fontSize: 12,
    color: "#7A6060",
    marginTop: 3,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C1F1F",
    marginLeft: 8,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(140,100,100,0.2)",
  },
  totalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(140,100,100,0.3)",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#7A6060",
  },
  totalValue: {
    fontSize: 13,
    color: "#2C1F1F",
    fontWeight: "500",
  },
  grandTotalRow: {
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C1F1F",
  },
  grandTotalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#C17C74",
  },

  // ── Info Rows ──
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(140,100,100,0.15)",
  },
  infoLabel: {
    fontSize: 13,
    color: "#7A6060",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: "#2C1F1F",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },

  // ── Payment Badge ──
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Actions ──
  actionsCard: {
    gap: 10,
    marginBottom: 4,
  },
  reorderBtn: {
    backgroundColor: "#C17C74",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },
  reorderBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  supportBtn: {
    backgroundColor: "#EDE0D8",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },
  supportBtnText: {
    color: "#2C1F1F",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelBtn: {
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C0444A",
  },
  cancelBtnText: {
    color: "#C0444A",
    fontWeight: "600",
    fontSize: 15,
  },

  // ── Empty / Error ──
  emptyText: {
    color: "#7A6060",
    fontSize: 13,
    textAlign: "center",
    padding: 12,
  },
});