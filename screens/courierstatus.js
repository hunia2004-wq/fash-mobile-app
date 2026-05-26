import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { getCourierSubmissions } from '../services/authService';

const C = {
  bg: '#F5F5F5', white: '#FFFFFF', accent: '#C17C74',
  accentLight: '#F6E9E6', text: '#1C1C1E', muted: '#8E8E93',
  border: '#E5E5EA', card: '#F2E6E3',
  success: '#34C759', successLight: '#E8F8EC',
  danger: '#FF3B30', dangerLight: '#FFF0EF',
  warning: '#FF9500', warningLight: '#FFF3E0',
};

const STATUS = {
  pending_review: { label: 'Pending Review', bg: C.warningLight, color: C.warning, icon: 'time-outline' },
  approved: { label: 'Accepted ✓', bg: C.successLight, color: C.success, icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected ✗', bg: C.dangerLight, color: C.danger, icon: 'close-circle-outline' },
};

const MOCK_JOBS = [
  { _id: 'j1', orderId: 'ORD-789456', itemId: 'ITEM-123ABC', reviewStatus: 'approved', submittedAt: new Date(Date.now() - 7200000).toISOString(), reviewNotes: null },
  { _id: 'j2', orderId: 'ORD-654321', itemId: 'ITEM-789DEF', reviewStatus: 'pending_review', submittedAt: new Date(Date.now() - 3600000).toISOString(), reviewNotes: null },
  { _id: 'j3', orderId: 'ORD-111000', itemId: 'ITEM-CCCDDD', reviewStatus: 'rejected', submittedAt: new Date(Date.now() - 86400000).toISOString(), reviewNotes: 'Item condition mismatch' },
];

const getId = (item) => item?._id || item?.id;

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function StatCard({ label, count, color }) {
  return (
    <View style={[styles.statCard, { borderTopWidth: 3, borderTopColor: color }]}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function CourierStatusScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [courierId, setCourierId] = useState('');

  const loadRef = React.useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const id = await SecureStore.getItemAsync('courierId').catch(() => '');
      setCourierId(id || '');
      const token = await SecureStore.getItemAsync('courierToken');
      const json = await getCourierSubmissions(token);
      setJobs(Array.isArray(json.submissions) ? json.submissions : []);
    } catch {
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useFocusEffect(useCallback(() => {
    load();
    const interval = setInterval(() => {
      if (loadRef.current) loadRef.current(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [load]));

  async function handleLogout() {
    await SecureStore.deleteItemAsync('courierToken');
    await SecureStore.deleteItemAsync('courierId');
    await SecureStore.deleteItemAsync('courierRole');
    navigation.replace('Welcome');
  }

  const filtered = jobs.filter(j =>
    filter === 'all' ? true :
      filter === 'pending' ? j.reviewStatus === 'pending_review' :
        filter === 'accepted' ? j.reviewStatus === 'approved' :
          filter === 'rejected' ? j.reviewStatus === 'rejected' : true
  );

  const counts = {
    all: jobs.length,
    pending: jobs.filter(j => j.reviewStatus === 'pending_review').length,
    accepted: jobs.filter(j => j.reviewStatus === 'approved').length,
    rejected: jobs.filter(j => j.reviewStatus === 'rejected').length,
  };

  function renderItem({ item }) {
    const cfg = STATUS[item.reviewStatus] ?? STATUS.pending_review;

    // Truncate long MongoDB IDs for display

    return (
      <View style={styles.card}>

        {/* Status strip */}
        <View style={[styles.cardStrip, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={15} color={cfg.color} />
          <Text style={[styles.cardStripText, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.cardStripTime}>{timeAgo(item.submittedAt)}</Text>
        </View>

        {/* Item row — image + name + IDs */}
        <View style={styles.itemRow}>
          {item.itemImage ? (
            <Image
              source={{ uri: item.itemImage }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="bag-outline" size={22} color={C.accent} />
            </View>
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.itemName || 'Fashion Item'}
            </Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeLabel}>Order</Text>
              <Text style={styles.idBadgeValue} numberOfLines={1}>#{item.orderId}</Text>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeLabel}>Item</Text>
              <Text style={styles.idBadgeValue} numberOfLines={1}>#{item.itemId}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {item.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="chatbubble-outline" size={13} color={C.muted} />
            <Text style={styles.notesText} numberOfLines={2}>{item.notes}</Text>
          </View>
        ) : null}

        {/* Rejection reason */}
        {item.reviewStatus === 'rejected' && item.reviewNotes && (
          <View style={styles.rejectionRow}>
            <Ionicons name="alert-circle-outline" size={14} color={C.danger} />
            <Text style={styles.rejectionText}>{item.reviewNotes}</Text>
          </View>
        )}

        {/* Action row */}
        {item.reviewStatus === 'approved' && (
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>Continue Order Process</Text>
          </TouchableOpacity>
        )}
        {item.reviewStatus === 'rejected' && (
          <TouchableOpacity style={styles.informBtn}>
            <Ionicons name="call-outline" size={16} color={C.danger} />
            <Text style={styles.informBtnText}>Inform the Seller</Text>
          </TouchableOpacity>
        )}
        {item.reviewStatus === 'pending_review' && (
          <View style={styles.pendingBanner}>
            <ActivityIndicator size="small" color={C.warning} />
            <Text style={styles.pendingBannerText}>Waiting for admin review...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ✅ No back button, renamed Pickup Status */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Pickup Status</Text>
          {courierId ? <Text style={styles.headerSub}>Courier ID: {courierId}</Text> : null}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={C.danger} />
        </TouchableOpacity>
      </View>

      {/* ✅ Submit New Request — full width */}
      <TouchableOpacity
        style={styles.submitNewBtn}
        onPress={() => navigation.navigate('CourierPickupScreen')}
      >
        <Ionicons name="add-circle-outline" size={20} color={C.white} />
        <Text style={styles.submitNewBtnText}>Submit New Request</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <StatCard label="Total" count={counts.all} color={C.accent} />
        <StatCard label="Pending" count={counts.pending} color={C.warning} />
        <StatCard label="Accepted" count={counts.accepted} color={C.success} />
        <StatCard label="Rejected" count={counts.rejected} color={C.danger} />
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {counts[f] > 0 ? ` (${counts[f]})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="package-variant" size={52} color={C.muted} />
          <Text style={styles.emptyTitle}>No {filter} pickups</Text>
          <Text style={styles.emptyText}>Submitted pickups will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={i => getId(i)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true); }}
              tintColor={C.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, backgroundColor: C.white,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  logoutBtn: { padding: 8 },
  submitNewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.accent, marginHorizontal: 16,
    marginTop: 14, marginBottom: 4, borderRadius: 14, paddingVertical: 14,
  },
  submitNewBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.white },
  statCard: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statCount: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6,
    borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: C.white,
  },
  filterTab: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, backgroundColor: C.bg },
  filterTabActive: { backgroundColor: C.accent },
  filterTabText: { fontSize: 12, color: C.muted, fontWeight: '500' },
  filterTabTextActive: { color: C.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  emptyText: { fontSize: 13, color: C.muted },
  card: {
    backgroundColor: C.white, borderRadius: 16, marginBottom: 12,
    borderWidth: 0.5, borderColor: C.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  cardStripText: { fontWeight: '600', fontSize: 13, flex: 1 },
  cardStripTime: { fontSize: 11, color: C.muted },

  // ✅ Enhanced item row
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  itemImage: {
    width: 58, height: 58, borderRadius: 10,
    backgroundColor: C.bg,
  },
  itemImagePlaceholder: {
    width: 58, height: 58, borderRadius: 10,
    backgroundColor: C.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  itemName: {
    fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2,
  },

  // ✅ Short ID badges
  idRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  idBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.bg, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  idBadgeLabel: { fontSize: 10, color: C.muted, fontWeight: '500' },
  idBadgeValue: { 
    fontSize: 11, color: C.text, fontWeight: '700', 
    flexShrink: 1 },

  cardBody: { paddingHorizontal: 14, paddingVertical: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  cardRowLabel: { fontSize: 13, color: C.muted },
  cardRowValue: { fontSize: 13, fontWeight: '600', color: C.text },
  cardDivider: { height: 0.5, backgroundColor: C.border },
  notesRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  notesText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },

  rejectionRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: C.dangerLight, paddingHorizontal: 14, paddingVertical: 10,
  },
  rejectionText: { flex: 1, fontSize: 12, color: C.danger, lineHeight: 18 },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.success, margin: 12,
    borderRadius: 12, paddingVertical: 12,
  },
  continueBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  informBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.dangerLight, margin: 12,
    borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: C.danger,
  },
  informBtnText: { color: C.danger, fontWeight: '700', fontSize: 13 },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: C.warningLight, paddingVertical: 10,
    margin: 12, borderRadius: 12,
  },
  pendingBannerText: { fontSize: 13, color: C.warning, fontWeight: '500' },
});