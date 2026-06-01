import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, TextInput, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions, ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './Biddingdata';
import { getAuctionById, placeBid as placeBidApi } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const QUICK = [5, 10, 25, 50];

// ── Countdown ────────────────────────────────────────────────
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

const pad = (n) => String(n).padStart(2, '0');

const CountBlock = ({ value, label, urgent }) => (
  <View style={[styles.countBlock, urgent && { backgroundColor: COLORS.liveLight }]}>
    <Text style={[styles.countValue, urgent && { color: COLORS.live }]}>{pad(value)}</Text>
    <Text style={[styles.countLabel, urgent && { color: COLORS.live }]}>{label}</Text>
  </View>
);

// ── Bid Row ──────────────────────────────────────────────────
const BidRow = ({ bid, isTop, isMe }) => {
  const slide = useRef(new Animated.Value(-20)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.bidRow,
      isTop && styles.bidRowTop,
      isMe && styles.bidRowMe,
      { opacity: fade, transform: [{ translateY: slide }] },
    ]}>
      <View style={[styles.bidAvatar, isTop && styles.bidAvatarTop]}>
        <Text style={[styles.bidAvatarText, isTop && { color: COLORS.white }]}>
          {bid.userName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.bidInfo}>
        <Text style={styles.bidName}>
          {isMe ? 'You' : bid.userName}
          {isTop ? <Text style={styles.topLabel}> · Highest</Text> : null}
        </Text>
        <Text style={styles.bidTime}>
          {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={[styles.bidAmt, isTop && { color: COLORS.accent }]}>EGP {bid.amount}</Text>
    </Animated.View>
  );
};

// ── Auction Ended Modal ──────────────────────────────────────
const AuctionEndedModal = ({ visible, iWon, finalBid, winnerName, onCheckout, onClose }) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>
        <Text style={styles.modalEmoji}>{iWon ? '🏆' : '😔'}</Text>
        <Text style={[styles.modalTitle, { color: iWon ? '#065F46' : '#991B1B' }]}>
          {iWon ? 'You Won!' : 'Auction Ended'}
        </Text>
        <Text style={styles.modalSub}>
          {iWon
            ? `Congratulations! You won with a bid of EGP ${finalBid}. Complete your purchase before the item is relisted.`
            : `This auction has ended. ${winnerName ? `Won by ${winnerName}.` : ''} Final price was EGP ${finalBid}.`
          }
        </Text>
        {iWon ? (
          <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout} activeOpacity={0.85}>
            <Text style={styles.checkoutBtnText}>Go to Checkout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeModalBtnText}>Browse More Auctions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </Modal>
);

// ── Main Screen ──────────────────────────────────────────────
export default function AuctionRoomScreen({ navigation, route }) {
  const { userId, getToken } = useAuth();
  const auctionId = route?.params?.auctionId ?? null;

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidInput, setBidInput] = useState('');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [endedModalVisible, setEndedModalVisible] = useState(false);
  const endedModalShown = useRef(false);

  const successAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const countdown = useCountdown(auction?.endsAt ?? new Date().toISOString());

  // Derived winner state — uses real server data, not local name matching
  const isEnded = auction?.status === 'ended' || countdown.ended;
  const iWon = isEnded && auction?.winnerId != null && auction?.winnerId === userId;
  const isLeading = !isEnded && auction?.currentBidderId != null && auction?.currentBidderId === userId;
  const suggested = auction ? auction.currentBid + 5 : 0;

  // ── Fetch ────────────────────────────────────────────────────
  const fetchAuction = useCallback(async () => {
    try {
      if (!auctionId) return;
      const data = await getAuctionById(auctionId);
      const a = data.auction ?? data;
      setAuction({
        id: a._id,
        title: a.title,
        brand: a.brand,
        description: a.description,
        category: a.category,
        condition: a.condition,
        size: a.size,
        image: a.images?.[0] ?? null,
        currentBid: a.currentBid,
        currentBidderId: a.currentBidder?._id ?? null,
        currentBidderName: a.currentBidder?.name ?? '—',
        bidCount: a.bids?.length ?? 0,
        endsAt: a.endTime,
        status: a.status ?? 'active',
        winnerId: a.winner ?? null,
        winnerName: a.currentBidder?.name ?? null,
      });
      setBids(
        (a.bids ?? []).map(b => ({
          id: b._id,
          userName: b.name,
          amount: b.amount,
          createdAt: b.createdAt,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch auction:', err.message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useFocusEffect(
    useCallback(() => {
      fetchAuction();
      const interval = setInterval(() => { fetchAuction(); }, 10000);
      return () => clearInterval(interval);
    }, [fetchAuction])
  );

  // Show ended modal once when auction ends
  useEffect(() => {
    if (isEnded && !endedModalShown.current && auction != null) {
      endedModalShown.current = true;
      setEndedModalVisible(true);
    }
  }, [isEnded, auction]);

  // ── Success toast ────────────────────────────────────────────
  const showSuccess = () => {
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // ── Place bid ────────────────────────────────────────────────
  const placeBid = async (amount) => {
    const val = parseFloat(amount || bidInput);
    if (!val || val <= 0) { Alert.alert('Invalid bid', 'Please enter a valid amount.'); return; }
    if (val <= auction.currentBid) { Alert.alert('Bid too low', `Must be higher than EGP ${auction.currentBid}`); return; }

    setPlacing(true);
    try {
      const token = await getToken();
      const data = await placeBidApi(token, auction.id, val);
      const updated = data.auction ?? data;

      setBids(prev => [{
        id: Date.now(),
        userName: 'You',
        amount: val,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setAuction(prev => ({
        ...prev,
        currentBid: val,
        currentBidderId: userId,
        bidCount: prev.bidCount + 1,
      }));
      setBidInput('');
      showSuccess();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      Alert.alert('Bid failed', err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Guards ───────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={COLORS.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!auction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Auction</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="hammer" size={48} color={COLORS.accent} />
          <Text style={{ color: COLORS.muted, marginTop: 12, fontSize: 15 }}>Auction not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: COLORS.accent, fontWeight: '700' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
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
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Image */}
          <View style={styles.imageBox}>
            {auction.image ? (
              <Image source={{ uri: auction.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="hanger" size={72} color={COLORS.accent} />
                <Text style={styles.imagePlaceholderBrand}>{auction.brand}</Text>
              </View>
            )}
            <View style={[styles.condOverlay, { backgroundColor: auction.condition === 'Like New' ? '#e8f5e9' : '#fff8e1' }]}>
              <Text style={[styles.condOverlayText, { color: auction.condition === 'Like New' ? '#388e3c' : '#f9a825' }]}>
                {auction.condition}
              </Text>
            </View>
          </View>

          {/* Item info */}
          <View style={styles.section}>
            <Text style={styles.itemBrand}>{auction.brand}</Text>
            <Text style={styles.itemTitle}>{auction.title}</Text>
            {auction.size ? <Text style={styles.itemSize}>Size: {auction.size}</Text> : null}
            <Text style={styles.itemDesc}>{auction.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Bid info */}
          <View style={styles.section}>
            <View style={styles.bidInfoRow}>
              <View>
                <Text style={styles.bidInfoLabel}>Current bid</Text>
                <Text style={styles.currentBid}>EGP {auction.currentBid}</Text>
                <Text style={styles.currentBidder}>
                  {isLeading ? 'You are leading!' : `by ${auction.currentBidderName}`}
                </Text>
              </View>
              <View style={styles.statsBox}>
                <Text style={styles.statsNumber}>{auction.bidCount}</Text>
                <Text style={styles.statsLabel}>bids</Text>
              </View>
            </View>

            {!isEnded ? (
              <View style={styles.countRow}>
                <CountBlock value={countdown.h} label="HRS" urgent={countdown.urgent} />
                <Text style={[styles.countSep, countdown.urgent && { color: COLORS.live }]}>:</Text>
                <CountBlock value={countdown.m} label="MIN" urgent={countdown.urgent} />
                <Text style={[styles.countSep, countdown.urgent && { color: COLORS.live }]}>:</Text>
                <CountBlock value={countdown.s} label="SEC" urgent={countdown.urgent} />
              </View>
            ) : (
              <View style={styles.endedBanner}>
                <Ionicons
                  name={iWon ? 'trophy' : 'checkmark-circle'}
                  size={18}
                  color={COLORS.success}
                />
                <Text style={styles.endedText}>
                  {iWon ? '🎉 You won this auction!' : 'Auction has ended'}
                </Text>
              </View>
            )}
          </View>

          {isLeading && !isEnded && (
            <View style={styles.leadingBanner}>
              <Ionicons name="trophy-outline" size={16} color={COLORS.success} />
              <Text style={styles.leadingText}>You are the highest bidder!</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Bid history */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bid History · {bids.length}</Text>
            {bids.length === 0 ? (
              <Text style={styles.noBids}>No bids yet — be the first!</Text>
            ) : (
              bids.map((bid, i) => (
                <BidRow
                  key={bid.id}
                  bid={bid}
                  isTop={i === 0}
                  isMe={bid.userName === 'You' || bid.userId === userId}
                />
              ))
            )}
          </View>

          <View style={{ height: 160 }} />
        </ScrollView>

        {/* Toast */}
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, {
            opacity: successAnim,
            transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}
        >
          <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
          <Text style={styles.toastText}>Bid placed!</Text>
        </Animated.View>

        {/* Bid bar */}
        {!isEnded && (
          <View style={styles.bidBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {QUICK.map(inc => (
                <TouchableOpacity
                  key={inc}
                  style={styles.quickBtn}
                  onPress={() => placeBid(auction.currentBid + inc)}
                  disabled={placing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickText}>+EGP{inc}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.suggestedTag}>
                <Text style={styles.suggestedText}>Suggested: EGP{suggested}</Text>
              </View>
            </ScrollView>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.dollar}>EGP</Text>
                <TextInput
                  style={styles.bidInput}
                  placeholder={`${suggested} or more`}
                  placeholderTextColor={COLORS.muted}
                  value={bidInput}
                  onChangeText={setBidInput}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={[styles.placeBidBtn, placing && { opacity: 0.6 }]}
                onPress={() => placeBid()}
                disabled={placing}
                activeOpacity={0.85}
              >
                <Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.placeBidText}>{placing ? 'Placing...' : 'Place Bid'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Ended Modal */}
      <AuctionEndedModal
        visible={endedModalVisible}
        iWon={iWon}
        finalBid={auction.currentBid}
        winnerName={auction.winnerName}
        onCheckout={() => {
          setEndedModalVisible(false);
          navigation.navigate('Payment', { item: auction, finalBid: auction.currentBid });
        }}
        onClose={() => {
          setEndedModalVisible(false);
          navigation.navigate('AuctionListScreen');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center', gap: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.live, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
  livePillText: { fontSize: 9, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  navTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, maxWidth: 200 },
  scrollContent: { paddingBottom: 20 },
  imageBox: { width, height: width * 0.85, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderBrand: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  condOverlay: { position: 'absolute', top: 14, left: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  condOverlayText: { fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },
  itemBrand: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 3 },
  itemSize: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  itemDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 20, marginTop: 8 },
  bidInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  bidInfoLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  currentBid: { fontSize: 34, fontWeight: '900', color: COLORS.accent, marginTop: 2 },
  currentBidder: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
  statsBox: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12 },
  statsNumber: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  statsLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  countBlock: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', minWidth: 68 },
  countValue: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  countLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '600', letterSpacing: 0.5 },
  countSep: { fontSize: 24, fontWeight: '800', color: COLORS.accent },
  endedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#e8f5e9', borderRadius: 12, paddingVertical: 14 },
  endedText: { fontSize: 15, fontWeight: '700', color: '#388e3c' },
  leadingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f5e9', marginHorizontal: 20, marginBottom: 4, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  leadingText: { fontSize: 13, fontWeight: '700', color: '#388e3c' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 14 },
  noBids: { fontSize: 14, color: COLORS.muted, textAlign: 'center', paddingVertical: 20 },
  bidRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  bidRowTop: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  bidRowMe: { borderColor: COLORS.accent },
  bidAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  bidAvatarTop: { backgroundColor: COLORS.accent },
  bidAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  bidInfo: { flex: 1 },
  bidName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  topLabel: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  bidTime: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  bidAmt: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  toast: { position: 'absolute', bottom: 160, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.success, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  toastText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  bidBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? 28 : 16 },
  quickRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, alignItems: 'center', gap: 8 },
  quickBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 4 },
  quickText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  suggestedTag: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.accentLight },
  suggestedText: { fontSize: 11, fontWeight: '600', color: COLORS.accent },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  dollar: { fontSize: 16, fontWeight: '700', color: COLORS.accent, marginRight: 4 },
  bidInput: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  placeBidBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
  placeBidText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  modalSheet: { backgroundColor: COLORS.white, borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  modalEmoji: { fontSize: 52, marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 10 },
  modalSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  checkoutBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  checkoutBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  closeModalBtn: { borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  closeModalBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 15 },
});