import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, Animated, RefreshControl,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, MOCK_AUCTIONS } from './Biddingdata';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const FILTERS = ['All', 'Ending Soon', 'Shoes', 'Bags', 'Accessories'];

const useCountdown = (endsAt) => {
  const calc = () => {
    const diff = new Date(endsAt) - new Date();
    if (diff <= 0) return { label: 'Ended', urgent: false, ended: true };
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const urgent = diff < 600000;
    if (hrs > 0) return { label: hrs + 'h ' + mins + 'm left', urgent, ended: false };
    if (mins > 0) return { label: mins + 'm ' + secs + 's left', urgent, ended: false };
    return { label: secs + 's left', urgent: true, ended: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return time;
};

const AuctionCard = ({ auction, onPress }) => {
  const countdown = useCountdown(auction.endsAt);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (countdown.urgent && !countdown.ended) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [countdown.urgent]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardImage}>
        {auction.image ? (
          <Image source={{ uri: auction.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="hanger" size={38} color={COLORS.accent} />
        )}
        {!countdown.ended && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{auction.category}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardBrand}>{auction.brand}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{auction.title}</Text>
        <View style={[styles.condTag, { backgroundColor: auction.condition === 'Like New' ? '#e8f5e9' : '#fff8e1' }]}>
          <Text style={[styles.condText, { color: auction.condition === 'Like New' ? '#388e3c' : '#f9a825' }]}>
            {auction.condition}
          </Text>
        </View>
        <Text style={styles.bidLabel}>Current bid</Text>
        <Text style={styles.bidAmount}>${auction.currentBid}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.timeTag, { backgroundColor: countdown.urgent ? COLORS.liveLight : COLORS.accentLight }]}>
            <Ionicons name="time-outline" size={10} color={countdown.urgent ? COLORS.live : COLORS.accent} />
            <Text style={[styles.timeText, { color: countdown.urgent ? COLORS.live : COLORS.accent }]}>
              {countdown.label}
            </Text>
          </View>
          <View style={styles.bidsRow}>
            <Ionicons name="people-outline" size={10} color={COLORS.muted} />
            <Text style={styles.bidsText}>{auction.bidCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AuctionListScreen({ navigation }) {
  const [auctions] = useState(MOCK_AUCTIONS);
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = auctions.filter((a) => {
    if (filter === 'All') return true;
    if (filter === 'Ending Soon') return new Date(a.endsAt) - new Date() < 3600000;
    return a.category === filter;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoWrap}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
          <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        </View>
            <View style={styles.liveIndicator}>
              <View style={styles.livePulse} />
            </View>
            <Text style={styles.headerTitle}>Live Bidding</Text>
          </View>
          <Text style={styles.headerSub}>{auctions.length} active auctions</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateAuction')} activeOpacity={0.85}>
          <Feather name="plus" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            {f === 'Ending Soon' && (
              <Ionicons name="flame-outline" size={12} color={filter === f ? COLORS.white : COLORS.live} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={COLORS.accent} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="hammer-outline" size={44} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyTitle}>No auctions found</Text>
            <Text style={styles.emptySub}>Check back soon for new auctions</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{filter === 'All' ? 'Active Auctions' : filter} · {filtered.length} items</Text>
            <View style={styles.grid}>
              {filtered.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onPress={() => navigation.navigate('AuctionRoom', { auctionId: auction.id })}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoWrap: { paddingBottom: 10, alignItems: 'center' },
  logo: { width: 120, height: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12,  borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  liveIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.liveLight, alignItems: 'center', justifyContent: 'center' },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.live },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 14, alignItems: 'center', height: 52 },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, alignSelf: 'center' },
  filterPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  filterTextActive: { color: COLORS.white },
  scrollContent: { paddingBottom: 48 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, paddingHorizontal: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  card: { width: CARD_W, backgroundColor: COLORS.white, borderRadius: 18, overflow: 'hidden', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardImage: { height: 170, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  liveBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.live, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
  liveText: { fontSize: 9, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  catBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },
  cardBody: { padding: 11 },
  cardBrand: { fontSize: 10, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  condTag: { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, marginTop: 5 },
  condText: { fontSize: 9, fontWeight: '700' },
  bidLabel: { fontSize: 10, color: COLORS.muted, marginTop: 8 },
  bidAmount: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  timeText: { fontSize: 10, fontWeight: '700' },
  bidsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bidsText: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
});