import React, { useState, useEffect, useRef } from ‘react’;
import {
View, Text, ScrollView, StyleSheet, TouchableOpacity,
StatusBar, Image, TextInput, KeyboardAvoidingView,
Platform, Animated, Alert, Dimensions,
} from ‘react-native’;
import { Ionicons, Feather, MaterialCommunityIcons } from ‘@expo/vector-icons’;
import { SafeAreaView } from ‘react-native-safe-area-context’;
import { supabase } from ‘./supabaseClient’;

const { width } = Dimensions.get(‘window’);

const COLORS = {
bg: ‘#F5F5F5’, card: ‘#F2E6E3’, accent: ‘#C17C74’,
accentLight: ‘#f7edec’, accentDark: ‘#a8635c’,
text: ‘#2c2c2c’, muted: ‘#888888’, white: ‘#ffffff’,
border: ‘rgba(193,124,116,0.18)’, iconBg: ‘#e3c8c5’,
live: ‘#E05C5C’, liveLight: ‘#fdecea’, success: ‘#6abf7b’,
};

const QUICK_BIDS = [5, 10, 25, 50];

// ─── Countdown ────────────────────────────────────────────────────────────
const useCountdown = (endsAt) => {
const calc = () => {
const diff = new Date(endsAt) - new Date();
if (diff <= 0) return { h: 0, m: 0, s: 0, ended: true, urgent: false };
const h = Math.floor(diff / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
return { h, m, s, ended: false, urgent: diff < 300000 };
};
const [time, setTime] = useState(calc);
useEffect(() => {
const t = setInterval(() => setTime(calc()), 1000);
return () => clearInterval(t);
}, [endsAt]);
return time;
};

// ─── Countdown block ──────────────────────────────────────────────────────
const CountdownBlock = ({ value, label, urgent }) => (
<View style={[styles.countBlock, urgent && { backgroundColor: COLORS.liveLight }]}>
<Text style={[styles.countValue, urgent && { color: COLORS.live }]}>
{String(value).padStart(2, ‘0’)}
</Text>
<Text style={[styles.countLabel, urgent && { color: COLORS.live }]}>{label}</Text>
</View>
);

// ─── Bid row ──────────────────────────────────────────────────────────────
const BidRow = ({ bid, isTop, isCurrentUser }) => {
const slideAnim = useRef(new Animated.Value(-20)).current;
const fadeAnim = useRef(new Animated.Value(0)).current;
useEffect(() => {
Animated.parallel([
Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
]).start();
}, []);

return (
<Animated.View
style={[
styles.bidRow,
isTop && styles.bidRowTop,
isCurrentUser && styles.bidRowMe,
{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
]}
>
<View style={[styles.bidAvatar, isTop && styles.bidAvatarTop]}>
<Text style={styles.bidAvatarText}>{bid.user_name.charAt(0).toUpperCase()}</Text>
</View>
<View style={styles.bidInfo}>
<Text style={styles.bidName}>
{isCurrentUser ? ‘You’ : bid.user_name}
{isTop && <Text style={styles.topBidLabel}> · Highest</Text>}
</Text>
<Text style={styles.bidTime}>
{new Date(bid.created_at).toLocaleTimeString([], { hour: ‘2-digit’, minute: ‘2-digit’ })}
</Text>
</View>
<Text style={[styles.bidAmount, isTop && { color: COLORS.accent }]}>
${Number(bid.amount).toFixed(0)}
</Text>
</Animated.View>
);
};

// ─── Main Screen ──────────────────────────────────────────────────────────
export default function AuctionRoomScreen({ navigation, route }) {
const { auctionId } = route.params;
const [auction, setAuction] = useState(null);
const [bids, setBids] = useState([]);
const [bidInput, setBidInput] = useState(’’);
const [placing, setPlacing] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [successAnim] = useState(new Animated.Value(0));
const scrollRef = useRef(null);

const countdown = useCountdown(auction?.ends_at || new Date());

// ── Fetch user ──────────────────────────────────────────────────────────
useEffect(() => {
supabase.auth.getUser().then(({ data }) => {
setCurrentUser(data?.user || null);
});
}, []);

// ── Fetch auction + bids ────────────────────────────────────────────────
useEffect(() => {
const fetchData = async () => {
const { data: auctionData } = await supabase
.from(‘auctions’).select(’*’).eq(‘id’, auctionId).single();
if (auctionData) setAuction(auctionData);

```
const { data: bidsData } = await supabase
.from('bids').select('*').eq('auction_id', auctionId)
.order('created_at', { ascending: false }).limit(50);
if (bidsData) setBids(bidsData);
};
fetchData();

// ── Real-time auction updates ──────────────────────────────────────
const auctionChannel = supabase
.channel(`auction-${auctionId}`)
.on('postgres_changes', {
event: 'UPDATE', schema: 'public', table: 'auctions',
filter: `id=eq.${auctionId}`,
}, (payload) => {
setAuction((prev) => ({ ...prev, ...payload.new }));
})
.subscribe();

// ── Real-time new bids ─────────────────────────────────────────────
const bidsChannel = supabase
.channel(`bids-${auctionId}`)
.on('postgres_changes', {
event: 'INSERT', schema: 'public', table: 'bids',
filter: `auction_id=eq.${auctionId}`,
}, (payload) => {
setBids((prev) => [payload.new, ...prev]);
setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
})
.subscribe();

return () => {
supabase.removeChannel(auctionChannel);
supabase.removeChannel(bidsChannel);
};
```

}, [auctionId]);

// ── Suggest next bid ────────────────────────────────────────────────────
const suggestedBid = auction
? Math.ceil(Number(auction.current_bid) + 5)
: 0;

// ── Place bid ───────────────────────────────────────────────────────────
const placeBid = async (amount) => {
if (!currentUser) {
Alert.alert(‘Sign in required’, ‘Please log in to place a bid.’);
return;
}
const bidAmount = parseFloat(amount || bidInput);
if (isNaN(bidAmount) || bidAmount <= 0) {
Alert.alert(‘Invalid bid’, ‘Please enter a valid amount.’);
return;
}
if (bidAmount <= Number(auction.current_bid)) {
Alert.alert(‘Bid too low’, `Your bid must be higher than $${Number(auction.current_bid).toFixed(0)}`);
return;
}

```
setPlacing(true);
const userName = currentUser.user_metadata?.full_name ||
currentUser.email?.split('@')[0] || 'Bidder';

const { data, error } = await supabase.rpc('place_bid', {
p_auction_id: auctionId,
p_user_id: currentUser.id,
p_user_name: userName,
p_amount: bidAmount,
});

setPlacing(false);
setBidInput('');

if (error || !data?.success) {
Alert.alert('Bid failed', data?.error || error?.message || 'Something went wrong.');
} else {
// Success animation
Animated.sequence([
Animated.timing(successAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
Animated.delay(1500),
Animated.timing(successAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
]).start();
}
```

};

const quickBid = (increment) => {
const newBid = Number(auction?.current_bid || 0) + increment;
placeBid(newBid);
};

if (!auction) {
return (
<SafeAreaView style={styles.safe}>
<View style={styles.loadingWrap}>
<MaterialCommunityIcons name="hammer" size={36} color={COLORS.accent} />
<Text style={styles.loadingText}>Loading auction…</Text>
</View>
</SafeAreaView>
);
}

const isLeading = currentUser && auction.current_bidder_id === currentUser.id;
const isEnded = countdown.ended || auction.status === ‘ended’;

return (
<SafeAreaView style={styles.safe} edges={[‘bottom’]}>
<StatusBar barStyle="dark-content" />

```
{/* Top nav */}
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

<KeyboardAvoidingView
style={{ flex: 1 }}
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
keyboardVerticalOffset={0}
>
<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

{/* Item image */}
<View style={styles.imageBox}>
{auction.image_url ? (
<Image source={{ uri: auction.image_url }} style={styles.itemImage} resizeMode="cover" />
) : (
<View style={styles.imagePlaceholder}>
<MaterialCommunityIcons name="hanger" size={64} color={COLORS.accent} />
</View>
)}
</View>

{/* Item info */}
<View style={styles.section}>
<View style={styles.itemTitleRow}>
<View style={{ flex: 1 }}>
<Text style={styles.itemBrand}>{auction.brand}</Text>
<Text style={styles.itemTitle}>{auction.title}</Text>
</View>
<View style={styles.conditionPill}>
<Text style={styles.conditionText}>{auction.condition}</Text>
</View>
</View>
{auction.description && (
<Text style={styles.itemDesc} numberOfLines={3}>{auction.description}</Text>
)}
</View>

<View style={styles.divider} />

{/* Bid info + countdown */}
<View style={styles.section}>
<View style={styles.bidInfoRow}>
<View>
<Text style={styles.bidInfoLabel}>Current bid</Text>
<Text style={styles.currentBid}>${Number(auction.current_bid).toFixed(0)}</Text>
{auction.current_bidder_name && (
<Text style={styles.currentBidder}>
by {isLeading ? 'You 🎉' : auction.current_bidder_name}
</Text>
)}
</View>
<View style={styles.statsCol}>
<View style={styles.statItem}>
<Ionicons name="people-outline" size={14} color={COLORS.muted} />
<Text style={styles.statValue}>{auction.bid_count}</Text>
<Text style={styles.statLabel}>bids</Text>
</View>
</View>
</View>

{/* Countdown */}
{!isEnded ? (
<View style={styles.countdownRow}>
<CountdownBlock value={countdown.h} label="HRS" urgent={countdown.urgent} />
<Text style={[styles.countSep, countdown.urgent && { color: COLORS.live }]}>:</Text>
<CountdownBlock value={countdown.m} label="MIN" urgent={countdown.urgent} />
<Text style={[styles.countSep, countdown.urgent && { color: COLORS.live }]}>:</Text>
<CountdownBlock value={countdown.s} label="SEC" urgent={countdown.urgent} />
</View>
) : (
<View style={styles.endedBanner}>
<Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
<Text style={styles.endedText}>
{isLeading ? '🎉 You won this auction!' : 'Auction ended'}
</Text>
</View>
)}
</View>

<View style={styles.divider} />

{/* Leading banner */}
{isLeading && !isEnded && (
<View style={styles.leadingBanner}>
<Ionicons name="trophy-outline" size={16} color={COLORS.success} />
<Text style={styles.leadingText}>You're currently the highest bidder!</Text>
</View>
)}

{/* Bid history */}
<View style={styles.section}>
<Text style={styles.sectionLabel}>Bid History · {bids.length}</Text>
<View ref={scrollRef}>
{bids.length === 0 ? (
<Text style={styles.noBids}>No bids yet — be the first!</Text>
) : (
bids.map((bid, i) => (
<BidRow
key={bid.id}
bid={bid}
isTop={i === 0}
isCurrentUser={currentUser && bid.user_id === currentUser.id}
/>
))
)}
</View>
</View>

<View style={{ height: 140 }} />
</ScrollView>

{/* Success toast */}
<Animated.View
style={[styles.successToast, { opacity: successAnim,
transform: [{ translateY: successAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
}]}
pointerEvents="none"
>
<Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
<Text style={styles.successToastText}>Bid placed successfully!</Text>
</Animated.View>

{/* Bid bar */}
{!isEnded && (
<View style={styles.bidBar}>
{/* Quick bid buttons */}
<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBidsRow}>
{QUICK_BIDS.map((inc) => (
<TouchableOpacity
key={inc}
style={styles.quickBidBtn}
onPress={() => quickBid(inc)}
activeOpacity={0.8}
disabled={placing}
>
<Text style={styles.quickBidText}>+${inc}</Text>
</TouchableOpacity>
))}
</ScrollView>

{/* Custom bid input */}
<View style={styles.bidInputRow}>
<View style={styles.bidInputWrap}>
<Text style={styles.dollarSign}>$</Text>
<TextInput
style={styles.bidInput}
placeholder={`${suggestedBid}+`}
placeholderTextColor={COLORS.muted}
value={bidInput}
onChangeText={setBidInput}
keyboardType="numeric"
/>
</View>
<TouchableOpacity
style={[styles.placeBidBtn, placing && { opacity: 0.6 }]}
onPress={() => placeBid()}
activeOpacity={0.85}
disabled={placing}
>
<Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
<Text style={styles.placeBidText}>{placing ? 'Placing…' : 'Place Bid'}</Text>
</TouchableOpacity>
</View>
</View>
)}
</KeyboardAvoidingView>
</SafeAreaView>
```

);
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: COLORS.bg },
loadingWrap: { flex: 1, alignItems: ‘center’, justifyContent: ‘center’, gap: 12 },
loadingText: { fontSize: 14, color: COLORS.muted },

topNav: {
flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘space-between’,
paddingHorizontal: 16, paddingVertical: 12,
backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
},
navBtn: {
width: 40, height: 40, borderRadius: 12,
backgroundColor: COLORS.card, alignItems: ‘center’, justifyContent: ‘center’,
},
navCenter: { flex: 1, alignItems: ‘center’, gap: 3 },
livePill: {
flexDirection: ‘row’, alignItems: ‘center’, gap: 4,
backgroundColor: COLORS.live, borderRadius: 8,
paddingHorizontal: 8, paddingVertical: 2,
},
liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
livePillText: { fontSize: 9, fontWeight: ‘800’, color: COLORS.white, letterSpacing: 0.5 },
navTitle: { fontSize: 14, fontWeight: ‘700’, color: COLORS.text, maxWidth: 200 },

scrollContent: { paddingBottom: 20 },

imageBox: { width: width, height: width * 0.9, backgroundColor: COLORS.card, alignItems: ‘center’, justifyContent: ‘center’ },
itemImage: { width: ‘100%’, height: ‘100%’ },
imagePlaceholder: { alignItems: ‘center’ },

section: { paddingHorizontal: 20, paddingVertical: 18 },
divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },

itemTitleRow: { flexDirection: ‘row’, alignItems: ‘flex-start’, gap: 10, marginBottom: 8 },
itemBrand: { fontSize: 11, fontWeight: ‘700’, color: COLORS.accent, textTransform: ‘uppercase’, letterSpacing: 0.5 },
itemTitle: { fontSize: 20, fontWeight: ‘800’, color: COLORS.text, marginTop: 2 },
conditionPill: {
backgroundColor: COLORS.accentLight, borderRadius: 10,
paddingHorizontal: 10, paddingVertical: 5, marginTop: 4,
},
conditionText: { fontSize: 11, fontWeight: ‘700’, color: COLORS.accent },
itemDesc: { fontSize: 13, color: COLORS.muted, lineHeight: 20 },

bidInfoRow: { flexDirection: ‘row’, justifyContent: ‘space-between’, alignItems: ‘flex-start’, marginBottom: 18 },
bidInfoLabel: { fontSize: 11, color: COLORS.muted, fontWeight: ‘600’, textTransform: ‘uppercase’, letterSpacing: 0.4 },
currentBid: { fontSize: 32, fontWeight: ‘900’, color: COLORS.accent, marginTop: 2 },
currentBidder: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
statsCol: { alignItems: ‘flex-end’ },
statItem: { flexDirection: ‘row’, alignItems: ‘center’, gap: 4 },
statValue: { fontSize: 14, fontWeight: ‘700’, color: COLORS.text },
statLabel: { fontSize: 12, color: COLORS.muted },

countdownRow: { flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘center’, gap: 6 },
countBlock: {
backgroundColor: COLORS.card, borderRadius: 12,
paddingHorizontal: 16, paddingVertical: 10, alignItems: ‘center’, minWidth: 64,
},
countValue: { fontSize: 24, fontWeight: ‘800’, color: COLORS.text },
countLabel: { fontSize: 10, color: COLORS.muted, fontWeight: ‘600’, letterSpacing: 0.5 },
countSep: { fontSize: 22, fontWeight: ‘800’, color: COLORS.accent },

endedBanner: {
flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘center’,
gap: 8, backgroundColor: ‘#e8f5e9’, borderRadius: 12, paddingVertical: 14,
},
endedText: { fontSize: 15, fontWeight: ‘700’, color: ‘#388e3c’ },

leadingBanner: {
flexDirection: ‘row’, alignItems: ‘center’, gap: 8,
backgroundColor: ‘#e8f5e9’, marginHorizontal: 20, marginBottom: 4,
borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
},
leadingText: { fontSize: 13, fontWeight: ‘700’, color: ‘#388e3c’ },

sectionLabel: {
fontSize: 11, fontWeight: ‘700’, color: COLORS.accent,
textTransform: ‘uppercase’, letterSpacing: 0.9, marginBottom: 14,
},
noBids: { fontSize: 14, color: COLORS.muted, textAlign: ‘center’, paddingVertical: 20 },

bidRow: {
flexDirection: ‘row’, alignItems: ‘center’, gap: 12,
backgroundColor: COLORS.white, borderRadius: 14,
padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
},
bidRowTop: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
bidRowMe: { borderColor: COLORS.accent },
bidAvatar: {
width: 36, height: 36, borderRadius: 18,
backgroundColor: COLORS.card, alignItems: ‘center’, justifyContent: ‘center’,
},
bidAvatarTop: { backgroundColor: COLORS.accent },
bidAvatarText: { fontSize: 15, fontWeight: ‘700’, color: COLORS.accent },
bidInfo: { flex: 1 },
bidName: { fontSize: 13, fontWeight: ‘700’, color: COLORS.text },
topBidLabel: { fontSize: 11, color: COLORS.accent, fontWeight: ‘600’ },
bidTime: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
bidAmount: { fontSize: 16, fontWeight: ‘800’, color: COLORS.text },

successToast: {
position: ‘absolute’, bottom: 160, alignSelf: ‘center’,
flexDirection: ‘row’, alignItems: ‘center’, gap: 8,
backgroundColor: COLORS.success, borderRadius: 20,
paddingHorizontal: 18, paddingVertical: 10,
shadowColor: ‘#000’, shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
},
successToastText: { fontSize: 13, fontWeight: ‘700’, color: COLORS.white },

bidBar: {
position: ‘absolute’, bottom: 0, left: 0, right: 0,
backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
paddingBottom: Platform.OS === ‘ios’ ? 28 : 16,
},
quickBidsRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
quickBidBtn: {
paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 8,
},
quickBidText: { fontSize: 13, fontWeight: ‘700’, color: COLORS.accent },
bidInputRow: {
flexDirection: ‘row’, alignItems: ‘center’, gap: 10, paddingHorizontal: 16,
},
bidInputWrap: {
flex: 1, flexDirection: ‘row’, alignItems: ‘center’,
backgroundColor: COLORS.card, borderRadius: 14,
paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border,
},
dollarSign: { fontSize: 16, fontWeight: ‘700’, color: COLORS.accent, marginRight: 4 },
bidInput: { flex: 1, fontSize: 16, fontWeight: ‘700’, color: COLORS.text },
placeBidBtn: {
flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘center’,
backgroundColor: COLORS.accent, borderRadius: 14,
paddingHorizontal: 20, paddingVertical: 14,
},
placeBidText: { fontSize: 14, fontWeight: ‘700’, color: COLORS.white },
});
