import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { getCourierSubmissions } from '../services/authService';
import { useTranslation } from 'react-i18next';
import i18n from '../source/i18n';

const C = {
  bg: '#F5F5F5', white: '#FFFFFF', accent: '#C17C74',
  accentLight: '#F6E9E6', text: '#1C1C1E', muted: '#8E8E93',
  border: '#E5E5EA', card: '#F2E6E3',
  success: '#34C759', successLight: '#E8F8EC',
  danger: '#FF3B30', dangerLight: '#FFF0EF',
  warning: '#FF9500', warningLight: '#FFF3E0',
};

const getId = (item) => item?._id || item?.id;

function timeAgo(dateStr, isRTL) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return isRTL ? 'الآن' : 'Just now';
  if (m < 60) return isRTL ? `منذ ${m} د` : `${m}m ago`;
  if (h < 24) return isRTL ? `منذ ${h} س` : `${h}h ago`;
  return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short' });
}

function StatCard({ label, count, color }) {
  return (
    <View style={[styles.statCard, { borderTopWidth: 3, borderTopColor: color }]}>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const LanguageToggle = () => {
  const { t } = useTranslation();
  const currentLang = i18n.language;
  const switchTo = currentLang === 'ar' ? 'en' : 'ar';
  const label = currentLang === 'ar' ? 'English' : 'العربية';

  return (
    <TouchableOpacity
      onPress={() => i18n.changeLanguage(switchTo)}
      style={styles.langBtn}
    >
      <Ionicons name="language-outline" size={16} color={C.accent} />
      <Text style={styles.langBtnText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function CourierStatusScreen({ navigation }) {
  const { t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [courierId, setCourierId] = useState('');

  const loadRef = React.useRef(null);

  const STATUS = {
    pending_review: { label: t('courier.status.pending_review'), bg: C.warningLight, color: C.warning, icon: 'time-outline' },
    approved:       { label: t('courier.status.accepted_label'), bg: C.successLight, color: C.success, icon: 'checkmark-circle-outline' },
    rejected:       { label: t('courier.status.rejected_label'), bg: C.dangerLight,  color: C.danger,  icon: 'close-circle-outline' },
  };

  const FILTER_LABELS = {
    all:      t('courier.status.all'),
    pending:  t('courier.status.pending'),
    accepted: t('courier.status.accepted'),
    rejected: t('courier.status.rejected'),
  };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const id = await SecureStore.getItemAsync('courierId').catch(() => '');
      setCourierId(id || '');
      const token = await SecureStore.getItemAsync('courierToken');
      const json = await getCourierSubmissions(token);
      setJobs(Array.isArray(json.submissions) ? json.submissions : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRef.current = load; }, [load]);

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
    filter === 'all'      ? true :
    filter === 'pending'  ? j.reviewStatus === 'pending_review' :
    filter === 'accepted' ? j.reviewStatus === 'approved' :
    filter === 'rejected' ? j.reviewStatus === 'rejected' : true
  );

  const counts = {
    all:      jobs.length,
    pending:  jobs.filter(j => j.reviewStatus === 'pending_review').length,
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
          <Text style={styles.cardStripTime}>{timeAgo(item.submittedAt, isRTL)}</Text>
        </View>

        {/* Item row */}
        <View style={[styles.itemRow, isRTL && styles.rowReverse]}>
          {item.itemImage ? (
            <Image source={{ uri: item.itemImage }} style={styles.itemImage} resizeMode="cover" />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="bag-outline" size={22} color={C.accent} />
            </View>
          )}
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.itemName, isRTL && styles.rtlText]} numberOfLines={1}>
              {item.itemName || t('courier.status.fashion_item')}
            </Text>
            <View style={[styles.idBadge, isRTL && styles.rowReverse]}>
              <Text style={styles.idBadgeLabel}>{t('courier.status.order')}</Text>
              <Text style={styles.idBadgeValue} numberOfLines={1}>#{item.id}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {item.notes ? (
          <View style={[styles.notesRow, isRTL && styles.rowReverse]}>
            <Ionicons name="chatbubble-outline" size={13} color={C.muted} />
            <Text style={[styles.notesText, isRTL && styles.rtlText]} numberOfLines={2}>{item.notes}</Text>
          </View>
        ) : null}

        {/* Rejection reason */}
        {item.reviewStatus === 'rejected' && item.reviewNotes && (
          <View style={[styles.rejectionRow, isRTL && styles.rowReverse]}>
            <Ionicons name="alert-circle-outline" size={14} color={C.danger} />
            <Text style={[styles.rejectionText, isRTL && styles.rtlText]}>{item.reviewNotes}</Text>
          </View>
        )}

        {/* Action buttons */}
        {item.reviewStatus === 'approved' && (
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>{t('courier.status.continue_process')}</Text>
          </TouchableOpacity>
        )}
        {item.reviewStatus === 'rejected' && (
          <TouchableOpacity style={styles.informBtn}>
            <Text style={styles.informBtnText}>{t('courier.status.inform_seller')}</Text>
          </TouchableOpacity>
        )}
        {item.reviewStatus === 'pending_review' && (
          <View style={styles.pendingBanner}>
            <ActivityIndicator size="small" color={C.warning} />
            <Text style={styles.pendingBannerText}>{t('courier.status.waiting_review')}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>{t('courier.status.title')}</Text>
          {courierId ? <Text style={[styles.headerSub, isRTL && styles.rtlText]}>ID: {courierId}</Text> : null}
        </View>
        <LanguageToggle />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={C.danger} />
        </TouchableOpacity>
      </View>

      {/* Submit New Request */}
      <TouchableOpacity
        style={styles.submitNewBtn}
        onPress={() => navigation.navigate('CourierPickupScreen')}
      >
        <Ionicons name="add-circle-outline" size={20} color={C.white} />
        <Text style={styles.submitNewBtnText}>{t('courier.status.submit_new')}</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label={t('courier.status.total')}    count={counts.all}      color={C.accent} />
        <StatCard label={t('courier.status.pending')}  count={counts.pending}  color={C.warning} />
        <StatCard label={t('courier.status.accepted')} count={counts.accepted} color={C.success} />
        <StatCard label={t('courier.status.rejected')} count={counts.rejected} color={C.danger} />
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
              {FILTER_LABELS[f]}{counts[f] > 0 ? ` (${counts[f]})` : ''}
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
          <Text style={[styles.emptyTitle, isRTL && styles.rtlText]}>
            {t('courier.status.no_pickups', { filter: FILTER_LABELS[filter] })}
          </Text>
          <Text style={[styles.emptyText, isRTL && styles.rtlText]}>
            {t('courier.status.submitted_appear')}
          </Text>
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
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accentLight, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, marginRight: 8,
  },
  langBtnText: { fontSize: 12, fontWeight: '600', color: C.accent },
  submitNewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.accent, marginHorizontal: 16,
    marginTop: 14, marginBottom: 4, borderRadius: 14, paddingVertical: 14,
  },
  submitNewBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.white },
  statCard: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: 'center' },
  statCount: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: C.muted, marginTop: 2, textAlign: 'center' },
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
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  itemImage: { width: 58, height: 58, borderRadius: 10, backgroundColor: C.bg },
  itemImagePlaceholder: {
    width: 58, height: 58, borderRadius: 10,
    backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  itemName: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  idBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  idBadgeLabel: { fontSize: 10, color: C.muted, fontWeight: '500' },
  idBadgeValue: { fontSize: 11, color: C.text, fontWeight: '700', flexShrink: 1 },
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
    gap: 6, backgroundColor: C.success, margin: 12, borderRadius: 12, paddingVertical: 12,
  },
  continueBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  informBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: C.dangerLight, margin: 12, borderRadius: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: C.danger,
  },
  informBtnText: { color: C.danger, fontWeight: '700', fontSize: 13 },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: C.warningLight, paddingVertical: 10, margin: 12, borderRadius: 12,
  },
  pendingBannerText: { fontSize: 13, color: C.warning, fontWeight: '500' },
  rowReverse: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});