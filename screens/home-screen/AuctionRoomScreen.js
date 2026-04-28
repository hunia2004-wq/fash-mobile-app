import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, TextInput, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, MOCK_AUCTIONS, MOCK_BIDS } from './Biddingdata';

const { width } = Dimensions.get('window');
const QUICK_INCREMENTS = [5, 10, 25, 50];


// ─── Countdown hook ─────────────────────────────────────────
const useCountdown = (endsAt) => {
  const calc = () => {
    const diff = new Date(endsAt) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0, ended: true, urgent: false };

    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      ended: false,
      urgent: diff < 300000,
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return time;
};


// ─── Countdown Block ────────────────────────────────────────
const CountdownBlock = ({ value, label, urgent }) => (
  <View style={[styles.countBlock, urgent && { backgroundColor: COLORS.liveLight }]}>
    <Text style={[styles.countValue, urgent && { color: COLORS.live }]}>
      {String(value).padStart(2, '0')}
    </Text>
    <Text style={[styles.countLabel, urgent && { color: COLORS.live }]}>{label}</Text>
  </View>
);


// ─── Bid Row ────────────────────────────────────────────────
const BidRow = ({ bid, isTop, isMe }) => {
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.bidRow,
      isTop && styles.bidRowTop,
      isMe && styles.bidRowMe,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      <View style={[styles.bidAvatar, isTop && styles.bidAvatarTop]}>
        <Text style={[styles.bidAvatarText, isTop && { color: COLORS.white }]}>
          {bid.userName?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>

      <View style={styles.bidInfo}>
        <Text style={styles.bidName}>
          {isMe ? 'You 🎉' : (bid.userName || 'Unknown')}
          {isTop && <Text style={styles.topLabel}> · Highest</Text>}
        </Text>
        <Text style={styles.bidTime}>
          {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <Text style={[styles.bidAmount, isTop && { color: COLORS.accent }]}>
        ${bid.amount}
      </Text>
    </Animated.View>
  );
};


// ─── Main Screen ────────────────────────────────────────────
export default function AuctionRoomScreen({ navigation, route }) {
  const { auctionId } = route.params || {};

  const auctionData = MOCK_AUCTIONS.find((a) => a.id === auctionId);

  const [auction, setAuction] = useState(auctionData || null);
  const [bids, setBids] = useState(
    (MOCK_BIDS[auctionId] || []).sort((a, b) => b.amount - a.amount)
  );

  const [bidInput, setBidInput] = useState('');
  const [placing, setPlacing] = useState(false);
  const [myBids, setMyBids] = useState([]);
  const [successAnim] = useState(new Animated.Value(0));

  const scrollRef = useRef(null);

  const countdown = useCountdown(
    auction?.endsAt ?? new Date(Date.now() + 1000).toISOString()
  );

  const suggestedBid = auction ? auction.currentBid + 5 : 0;
  const isLeading = bids[0]?.userName === 'You';
  const isEnded = countdown.ended;


  const showSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };


  const placeBid = (amount) => {
    const bidAmount = parseFloat(amount ?? bidInput);

    if (!bidAmount || isNaN(bidAmount)) {
      Alert.alert('Invalid bid', 'Please enter a valid amount.');
      return;
    }

    if (bidAmount <= auction.currentBid) {
      Alert.alert('Bid too low', `Your bid must be higher than $${auction.currentBid}.`);
      return;
    }

    setPlacing(true);

    setTimeout(() => {
      const newBid = {
        id: `new_${Date.now()}`,
        userName: 'You',
        amount: bidAmount,
        createdAt: new Date().toISOString(),
      };

      setBids((prev) => {
        const updated = [newBid, ...prev];
        return updated.sort((a, b) => b.amount - a.amount);
      });

      setMyBids((prev) => [...prev, newBid]);

      setAuction((prev) => ({
        ...prev,
        currentBid: bidAmount,
        currentBidderName: 'You',
        bidCount: prev.bidCount + 1,
      }));

      setBidInput('');
      setPlacing(false);
      showSuccess();

      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    }, 600);
  };


  const quickBid = (increment) => {
    placeBid(auction.currentBid + increment);
  };


  if (!auction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Auction not found.</Text>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          {!isEnded && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.livePillText}>LIVE</Text>
            </View>
          )}
          <Text style={styles.navTitle} numberOfLines={1}>{auction.title}</Text>
        </View>

        <TouchableOpacity style={styles.navBtn}>
          <Ionicons name="share-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* KEEP ALL YOUR EXISTING UI BELOW EXACTLY THE SAME */}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: COLORS.muted },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  navCenter: { flex: 1, alignItems: 'center', gap: 3 },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.live, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
  livePillText: { fontSize: 9, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  navTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, maxWidth: 200 },

  scrollContent: { paddingBottom: 20 },

  imageBox: {
    width, height: width * 0.85,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  itemImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 14, fontWeight: '700', color: COLORS.accent },

  conditionOverlay: {
    position: 'absolute', top: 14, left: 14,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  conditionOverlayText: { fontSize: 11, fontWeight: '700' },

  section: { paddingHorizontal: 20, paddingVertical: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  itemBrand: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 3 },
  itemSize: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  itemDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },

  bidInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  bidInfoLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  currentBid: { fontSize: 34, fontWeight: '900', color: COLORS.accent, marginTop: 2 },
  currentBidder: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  statsBox: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12 },
  statsNumber: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  statsLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },

  countdownRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
  countBlock: {
    backgroundColor: COLORS.card, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 10,
    alignItems: 'center', minWidth: 68,
  },
  countValue: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  countLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '600', letterSpacing: 0.5 },
  countSep: { fontSize: 24, fontWeight: '800', color: COLORS.accent },

  endedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#e8f5e9', borderRadius: 12, paddingVertical: 14,
  },
  endedText: { fontSize: 15, fontWeight: '700', color: '#388e3c' },

  leadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e8f5e9', marginHorizontal: 20, marginBottom: 4,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  leadingText: { fontSize: 13, fontWeight: '700', color: '#388e3c' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 14,
  },
  noBids: { fontSize: 14, color: COLORS.muted, textAlign: 'center', paddingVertical: 20 },

  bidRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 14, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  bidRowTop: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  bidRowMe: { borderColor: COLORS.accent },
  bidAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  bidAvatarTop: { backgroundColor: COLORS.accent },
  bidAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  bidInfo: { flex: 1 },
  bidName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  topLabel: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  bidTime: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  bidAmount: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  successToast: {
    position: 'absolute', bottom: 160, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.success, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  successToastText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  bidBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  quickBidsRow: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    alignItems: 'center', gap: 8,
  },
  quickBidBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 4,
  },
  quickBidText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  suggestedTag: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, backgroundColor: COLORS.accentLight,
  },
  suggestedText: { fontSize: 11, fontWeight: '600', color: COLORS.accent },

  bidInputRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingHorizontal: 16,
  },
  bidInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dollarSign: { fontSize: 16, fontWeight: '700', color: COLORS.accent, marginRight: 4 },
  bidInput: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  placeBidBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  placeBidText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});