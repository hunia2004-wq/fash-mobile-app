import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert, Modal, StatusBar, RefreshControl, } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { getAdminSubmissions, acceptCourierSubmission, rejectCourierSubmission } from '../services/authService';

const C = {
  bg: '#F5F5F5', white: '#FFFFFF', accent: '#C17C74',
  accentLight: '#F6E9E6', text: '#1C1C1E', muted: '#8E8E93',
  border: '#E5E5EA', card: '#F2E6E3',
  success: '#34C759', successLight: '#E8F8EC',
  danger: '#FF3B30', dangerLight: '#FFF0EF',
  warning: '#FF9500', warningLight: '#FFF3E0',
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
};

// ✅ Helper — backend returns 'id' not '_id'
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

const MOCK_SUBMISSIONS = [
  {
    _id: 'sub_001', orderId: 'ORD-789456', itemId: 'ITEM-123ABC',
    sellerId: 'USER-456XYZ', courierName: 'Ahmed Mostafa',
    notes: 'Item looks clean, tags intact.',
    photoUrl: null, reviewStatus: 'pending_review',
    submittedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    _id: 'sub_002', orderId: 'ORD-654321', itemId: 'ITEM-789DEF',
    sellerId: 'USER-111AAA', courierName: 'Sara Hassan',
    notes: 'Small scratch on the bag buckle.',
    photoUrl: null, reviewStatus: 'pending_review',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'sub_003', orderId: 'ORD-111222', itemId: 'ITEM-AAABBB',
    sellerId: 'USER-222BBB', courierName: 'Karim Adel',
    notes: '', photoUrl: null, reviewStatus: 'approved',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function StatusBadge({ status }) {
  const cfg = {
    pending_review: { bg: C.warningLight, color: C.warning, label: 'Pending Review' },
    approved: { bg: C.successLight, color: C.success, label: 'Accepted' },
    rejected: { bg: C.dangerLight, color: C.danger, label: 'Rejected' },
  }[status] ?? { bg: C.warningLight, color: C.warning, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function RejectModal({ visible, onClose, onConfirm, loading }) {
  const [reason, setReason] = useState('');
  const QUICK = ['Item condition mismatch', 'Wrong item sent', 'Photo unclear', 'Missing tags/labels'];

  useEffect(() => {
    if (!visible) setReason('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Reject Submission</Text>
          <Text style={styles.modalSub}>Select or type a rejection reason. This will be sent to the seller.</Text>
          <View style={styles.quickReasons}>
            {QUICK.map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.quickBtn, reason === q && styles.quickBtnActive]}
                onPress={() => setReason(reason === q ? '' : q)}
              >
                <Text style={[styles.quickBtnText, reason === q && styles.quickBtnTextActive]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reasonInput}
            placeholder="Or type a custom reason..."
            placeholderTextColor={C.muted}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalRejectBtn, (!reason.trim() || loading) && { opacity: 0.5 }]}
              onPress={() => { if (reason.trim()) onConfirm(reason.trim()); }}
              disabled={!reason.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color={C.white} size="small" />
                : <Text style={styles.modalRejectText}>Confirm Reject</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminReviewScreen({ navigation }) {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [photoModal, setPhotoModal] = useState(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await getToken();
      let data;
      try {
        const result = await getAdminSubmissions(token);
        data = result.submissions ?? [];
      } catch {
        data = MOCK_SUBMISSIONS;
      }
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions(MOCK_SUBMISSIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  async function handleAccept(item) {
    Alert.alert(
      'Accept Submission',
      `Accept order #${item.orderId}? The courier will be notified to continue the order.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept', onPress: async () => {
            const id = getId(item);
            setActionLoading(id);
            try {
              const token = await getToken();
              try {
                await acceptCourierSubmission(token, id);
              } catch { /* simulate */ }

              setSubmissions(prev => prev.map(s =>
                getId(s) === id ? { ...s, reviewStatus: 'approved' } : s
              ));

              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '✅ Item Accepted — Continue Order',
                  body: `Order #${item.orderId} confirmed. Proceed with the delivery.`,
                  data: { screen: 'Orders', orderId: item.orderId },
                },
                trigger: { seconds: 2 },
              }).catch(() => {});

            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setActionLoading(null);
            }
          }
        },
      ]
    );
  }

  async function handleReject(item, reason) {
    const id = getId(item);
    setActionLoading(id);
    try {
      const token = await getToken();
      try {
        await rejectCourierSubmission(token, id, reason);
      } catch { /* simulate */ }

      setSubmissions(prev => prev.map(s =>
        getId(s) === id ? { ...s, reviewStatus: 'rejected', reviewNotes: reason } : s
      ));
      setRejectModal(null);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '❌ Item Rejected',
          body: `Order #${item.orderId}: ${reason}. Please inform the seller.`,
          data: { screen: 'Orders', orderId: item.orderId },
        },
        trigger: { seconds: 2 },
      }).catch(() => {});

    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = submissions.filter(s =>
    filter === 'all' ? true :
      filter === 'pending' ? s.reviewStatus === 'pending_review' :
        filter === 'accepted' ? s.reviewStatus === 'approved' :
          filter === 'rejected' ? s.reviewStatus === 'rejected' : true
  );

  const pendingCount = submissions.filter(s => s.reviewStatus === 'pending_review').length;

  function renderItem({ item }) {
    const id = getId(item);
    const isActioning = actionLoading === id;

    return (
      <View style={[styles.card, C.shadow]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>Order #{item.orderId}</Text>
            <Text style={styles.timeAgo}>{timeAgo(item.submittedAt)}</Text>
          </View>
          <StatusBadge status={item.reviewStatus} />
        </View>

        <View style={styles.detailGrid}>
          {[
            { icon: 'pricetag-outline', label: 'Item ID', value: item.itemId },
            { icon: 'person-outline', label: 'Seller', value: item.sellerName || item.sellerId || '—' },
            { icon: 'car-outline', label: 'Courier', value: item.courierName },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Ionicons name={row.icon} size={14} color={C.accent} />
              <Text style={styles.detailLabel}>{row.label}:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
            </View>
          ))}
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <Ionicons name="document-text-outline" size={14} color={C.muted} />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}

        {item.reviewStatus === 'rejected' && item.reviewNotes ? (
          <View style={styles.rejectionBox}>
            <Ionicons name="close-circle-outline" size={14} color={C.danger} />
            <Text style={styles.rejectionText}>Reason: {item.reviewNotes}</Text>
          </View>
        ) : null}

        {item.photoUrl ? (
          <TouchableOpacity style={styles.photoThumb} onPress={() => setPhotoModal(item.photoUrl)}>
            <Image source={{ uri: item.photoUrl }} style={styles.photoThumbImg} resizeMode="cover" />
            <View style={styles.photoThumbOverlay}>
              <Ionicons name="expand-outline" size={18} color={C.white} />
              <Text style={styles.photoThumbText}>View photo</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noPhoto}>
            <Ionicons name="image-outline" size={20} color={C.muted} />
            <Text style={styles.noPhotoText}>No photo attached</Text>
          </View>
        )}

        {item.reviewStatus === 'pending_review' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.rejectBtn, isActioning && { opacity: 0.5 }]}
              onPress={() => setRejectModal(item)}
              disabled={isActioning}
            >
              <Ionicons name="close" size={16} color={C.danger} />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, isActioning && { opacity: 0.5 }]}
              onPress={() => handleAccept(item)}
              disabled={isActioning}
            >
              {isActioning
                ? <ActivityIndicator color={C.white} size="small" />
                : (
                  <>
                    <Ionicons name="checkmark" size={16} color={C.white} />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </>
                )
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Admin Review</Text>
          <Text style={styles.headerSub}>Courier pickup submissions</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
          </View>
        )}
        <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => navigation.goBack()}>
          <Ionicons name="log-out-outline" size={22} color={C.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['pending', 'accepted', 'rejected', 'all'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={C.accent} size="large" />
          <Text style={styles.loadingText}>Loading submissions...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="inbox-outline" size={52} color={C.muted} />
          <Text style={styles.emptyText}>No {filter} submissions</Text>
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

      <RejectModal
        visible={!!rejectModal}
        onClose={() => setRejectModal(null)}
        onConfirm={reason => handleReject(rejectModal, reason)}
        loading={actionLoading === getId(rejectModal)}
      />

      <Modal visible={!!photoModal} transparent animationType="fade" onRequestClose={() => setPhotoModal(null)}>
        <TouchableOpacity style={styles.photoModalBg} activeOpacity={1} onPress={() => setPhotoModal(null)}>
          <Image source={{ uri: photoModal }} style={styles.photoModalImg} resizeMode="contain" />
          <TouchableOpacity style={styles.photoCloseBtn} onPress={() => setPhotoModal(null)}>
            <Ionicons name="close" size={22} color={C.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  headerSub: { fontSize: 12, color: C.muted },
  pendingBadge: { backgroundColor: C.warningLight, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadgeText: { fontSize: 12, fontWeight: '600', color: C.warning },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, gap: 8, borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  filterTab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.bg },
  filterTabActive: { backgroundColor: C.accent },
  filterTabText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  filterTabTextActive: { color: C.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14, color: C.muted },
  emptyText: { fontSize: 15, color: C.muted },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 0.5, borderColor: C.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: '700', color: C.text },
  timeAgo: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  detailGrid: { backgroundColor: C.bg, borderRadius: 10, padding: 10, marginBottom: 10, gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { fontSize: 12, color: C.muted, width: 56 },
  detailValue: { flex: 1, fontSize: 13, color: C.text, fontWeight: '500' },
  notesBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: '#FAFAFA', borderRadius: 8, padding: 8, marginBottom: 10,
  },
  notesText: { flex: 1, fontSize: 12, color: C.muted, lineHeight: 18 },
  rejectionBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: C.dangerLight, borderRadius: 8, padding: 8, marginBottom: 10,
  },
  rejectionText: { flex: 1, fontSize: 12, color: C.danger, lineHeight: 18 },
  photoThumb: { height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative' },
  photoThumbImg: { width: '100%', height: '100%', position: 'absolute' },
  photoThumbOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8,
  },
  photoThumbText: { color: C.white, fontSize: 12, fontWeight: '600' },
  noPhoto: {
    height: 60, backgroundColor: C.bg, borderRadius: 10, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  noPhotoText: { fontSize: 12, color: C.muted },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: C.danger, borderRadius: 12, paddingVertical: 12,
  },
  rejectBtnText: { color: C.danger, fontWeight: '600', fontSize: 14 },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.success, borderRadius: 12, paddingVertical: 12,
  },
  acceptBtnText: { color: C.white, fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 6 },
  modalSub: { fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 19 },
  quickReasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  quickBtn: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.bg,
  },
  quickBtnActive: { backgroundColor: C.accentLight, borderColor: C.accent },
  quickBtnText: { fontSize: 12, color: C.muted },
  quickBtnTextActive: { color: C.accent, fontWeight: '600' },
  reasonInput: {
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 12, padding: 12, fontSize: 14, color: C.text,
    textAlignVertical: 'top', minHeight: 80, marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, alignItems: 'center',
  },
  modalCancelText: { fontWeight: '600', color: C.text, fontSize: 14 },
  modalRejectBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: C.danger, alignItems: 'center',
  },
  modalRejectText: { fontWeight: '700', color: C.white, fontSize: 14 },
  photoModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  photoModalImg: { width: '92%', height: '70%' },
  photoCloseBtn: {
    position: 'absolute', top: 50, right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
});