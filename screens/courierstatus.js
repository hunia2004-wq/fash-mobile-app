import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, } from 'react-native';
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

  const loadRef = React.useRef();

async function load(silent = false) {
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
}

// Keep ref updated so interval always calls latest version
loadRef.current = load;

useFocusEffect(useCallback(() => {
  load();

  // ✅ Poll every 15 seconds while screen is focused
  const interval = setInterval(() => {
    loadRef.current(true);
  }, 15000);

  // ✅ Cleanup when screen loses focus
  return () => clearInterval(interval);

}, []));



  // Add logout function:
  async function handleLogout() {
    await SecureStore.deleteItemAsync('courierToken');
    await SecureStore.deleteItemAsync('courierId');
    await SecureStore.deleteItemAsync('courierRole');
    navigation.replace('Welcome');
  }

  useFocusEffect(useCallback(() => { load(); }, []));

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

    return (
      <View style={styles.card}>
        {/* Status strip */}
        <View style={[styles.cardStrip, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={15} color={cfg.color} />
          <Text style={[styles.cardStripText, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.cardStripTime}>{timeAgo(item.submittedAt)}</Text>
        </View>

        {/* Details */}
        <View style={styles.cardBody}>
          <View key="order" style={styles.cardRow}>
            <Text style={styles.cardRowLabel}>Order</Text>
            <Text style={styles.cardRowValue}>#{item.orderId}</Text>
          </View>
          <View style={styles.cardDivider} />
          <View key="itemId" style={styles.cardRow}>
            <Text style={styles.cardRowLabel}>Item ID</Text>
            <Text style={styles.cardRowValue}>{item.itemId}</Text>
          </View>

        {/* Rejection reason */}
        {item.reviewStatus === 'rejected' && item.reviewNotes && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.rejectionRow}>
              <Ionicons name="alert-circle-outline" size={14} color={C.danger} />
              <Text style={styles.rejectionText}>{item.reviewNotes}</Text>
            </View>
          </>
        )}
      </View>

        {/* Action row */ }
    {
      item.reviewStatus === 'accepted' && (
        <TouchableOpacity style={styles.continueBtn}>
          <Ionicons name="arrow-forward-circle-outline" size={16} color={C.white} />
          <Text style={styles.continueBtnText}>Continue Order Process</Text>
        </TouchableOpacity>
      )
    }
    {
      item.reviewStatus === 'rejected' && (
        <TouchableOpacity style={styles.informBtn}>
          <Text style={styles.informBtnText}>Inform the Seller</Text>
        </TouchableOpacity>
      )
    }
    {
      item.reviewStatus === 'pending_review' && (
        <View style={styles.pendingBanner}>
          <ActivityIndicator size="small" color={C.warning} />
          <Text style={styles.pendingBannerText}>Waiting for admin review...</Text>
        </View>
      )
    }
      </View >
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Pickups</Text>
          {courierId ? <Text style={styles.headerSub}>Courier ID: {courierId}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.newPickupBtn}
          onPress={() => navigation.navigate('CourierPickupScreen')}
        >
          <Ionicons name="add" size={18} color={C.white} />
          <Text style={styles.newPickupText}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 8 }}>
          <Ionicons name="log-out-outline" size={22} color={C.danger} />
        </TouchableOpacity>
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <StatCard label="Total" count={counts.all} color={C.accent} />
        <StatCard label="Pending" count={counts.pending} color={C.warning} />
        <StatCard label="Accepted" count={counts.accepted} color={C.success} />
        <StatCard label="Rejected" count={counts.rejected} color={C.danger} />
      </View>

      {/* Filter tabs */}
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
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('CourierPickupScreen')}
          >
            <Text style={styles.emptyBtnText}>Submit a Pickup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={i => i._id || i.id}
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
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  newPickupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
  },
  newPickupText: { color: C.white, fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.white },
  statCard: {
    flex: 1, backgroundColor: C.bg, borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
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
  emptyBtn: {
    marginTop: 8, backgroundColor: C.accent, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  emptyBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: C.white, borderRadius: 14, marginBottom: 12,
    borderWidth: 0.5, borderColor: C.border, overflow: 'hidden',
  },
  cardStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  cardStripText: { fontWeight: '600', fontSize: 13, flex: 1 },
  cardStripTime: { fontSize: 11, color: C.muted },
  cardBody: { paddingHorizontal: 14, paddingVertical: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  cardRowLabel: { fontSize: 13, color: C.muted },
  cardRowValue: { fontSize: 13, fontWeight: '600', color: C.text },
  cardDivider: { height: 0.5, backgroundColor: C.border },
  rejectionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingTop: 8 },
  rejectionText: { flex: 1, fontSize: 12, color: C.danger, lineHeight: 18 },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.success, margin: 12, marginTop: 0,
    borderRadius: 10, paddingVertical: 11,
  },
  continueBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  informBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.dangerLight, margin: 12, marginTop: 0,
    borderRadius: 10, paddingVertical: 11,
    borderWidth: 1, borderColor: C.danger,
  },
  informBtnText: { color: C.danger, fontWeight: '700', fontSize: 13 },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: C.warningLight, paddingVertical: 10, margin: 12, marginTop: 0, borderRadius: 10,
  },
  pendingBannerText: { fontSize: 13, color: C.warning, fontWeight: '500' },
});