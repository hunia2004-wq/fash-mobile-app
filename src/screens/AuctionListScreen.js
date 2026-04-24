import React, { useState, useEffect, useCallback } from ‘react’;
import {
View, Text, ScrollView, StyleSheet, TouchableOpacity,
StatusBar, Image, RefreshControl, Dimensions, Animated,
} from ‘react-native’;
import { Ionicons, Feather, MaterialCommunityIcons } from ‘@expo/vector-icons’;
import { SafeAreaView } from ‘react-native-safe-area-context’;
import { supabase } from ‘./supabaseClient’;

const { width } = Dimensions.get(‘window’);
const CARD_W = (width - 48) / 2;

const COLORS = {
bg: ‘#F5F5F5’, card: ‘#F2E6E3’, accent: ‘#C17C74’,
accentLight: ‘#f7edec’, text: ‘#2c2c2c’, muted: ‘#888888’,
white: ‘#ffffff’, border: ‘rgba(193,124,116,0.18)’,
iconBg: ‘#e3c8c5’, live: ‘#E05C5C’, liveLight: ‘#fdecea’,
success: ‘#6abf7b’,
};


const useCountdown = (endsAt) => {
const calc = () => {
const diff = new Date(endsAt) - new Date();
if (diff <= 0) return { label: ‘Ended’, urgent: false, ended: true };
const h = Math.floor(diff / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
const urgent = diff < 600000; // < 10 min
if (h > 0) return { label: `${h}h ${m}m left`, urgent, ended: false };
if (m > 0) return { label: `${m}m ${s}s left`, urgent, ended: false };
return { label: `${s}s left`, urgent: true, ended: false };
};
const [time, setTime] = useState(calc);
useEffect(() => {
const t = setInterval(() => setTime(calc()), 1000);
return () => clearInterval(t);
}, [endsAt]);
return time;
};

const AuctionCard = ({ auction, onPress }) => {
const countdown = useCountdown(auction.ends_at);
const pulse = React.useRef(new Animated.Value(1)).current;

useEffect(() => {
if (countdown.urgent && !countdown.ended) {
Animated.loop(
Animated.sequence([
Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
])
).start();
}
}, [countdown.urgent]);

return (
<TouchableOpacity style={styles.auctionCard} onPress={onPress} activeOpacity={0.88}>
{/* Image */}
<View style={styles.cardImageBox}>
{auction.image_url ? (
<Image source={{ uri: auction.image_url }} style={styles.cardImage} resizeMode=“cover” />
) : (
<MaterialCommunityIcons name="hanger" size={36} color={COLORS.accent} />
)}

```
{/* Live badge */}
{!countdown.ended && (
<View style={styles.liveBadge}>
<Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
<Text style={styles.liveText}>LIVE</Text>
</View>
)}

{/* Category */}
<View style={styles.categoryBadge}>
<Text style={styles.categoryBadgeText}>{auction.category}</Text>
</View>
</View>

{/* Info */}
<View style={styles.cardInfo}>
<Text style={styles.cardBrand}>{auction.brand}</Text>
<Text style={styles.cardTitle} numberOfLines={1}>{auction.title}</Text>

<Text style={styles.cardBidLabel}>Current bid</Text>
<Text style={styles.cardBid}>${Number(auction.current_bid).toFixed(0)}</Text>

{/* Footer */}
<View style={styles.cardFooter}>
<View style={[
styles.timeTag,
{ backgroundColor: countdown.urgent ? COLORS.liveLight : COLORS.accentLight }
]}>
<Ionicons
name="time-outline"
size={10}
color={countdown.urgent ? COLORS.live : COLORS.accent}
/>
<Text style={[
styles.timeText,
{ color: countdown.urgent ? COLORS.live : COLORS.accent }
]}>
{countdown.label}
</Text>
</View>
<View style={styles.bidCountRow}>
<Ionicons name="people-outline" size={10} color={COLORS.muted} />
<Text style={styles.bidCount}>{auction.bid_count}</Text>
</View>
</View>
</View>
</TouchableOpacity>
```

);
};

const EmptyState = () => (
<View style={styles.emptyWrap}>
<View style={styles.emptyRing}>
<Ionicons name="hammer-outline" size={44} color={COLORS.accent} />
</View>
<Text style={styles.emptyTitle}>No live auctions</Text>
<Text style={styles.emptySub}>Check back soon — new auctions go live daily</Text>
</View>
);


export default function AuctionListScreen({ navigation }) {
const [auctions, setAuctions] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [filter, setFilter] = useState(‘All’);

const FILTERS = [‘All’, ‘Ending Soon’, ‘Shoes’, ‘Bags’, ‘Accessories’, ‘Tops’];

const fetchAuctions = async () => {
const { data, error } = await supabase
.from(‘auctions’)
.select(’*’)
.eq(‘status’, ‘active’)
.gt(‘ends_at’, new Date().toISOString())
.order(‘ends_at’, { ascending: true });
if (!error && data) setAuctions(data);
setLoading(false);
setRefreshing(false);
};

useEffect(() => {
fetchAuctions();

```
// Real-time subscription — update auction cards live
const channel = supabase
.channel('auction-list')
.on('postgres_changes', {
event: '*',
schema: 'public',
table: 'auctions',
}, (payload) => {
if (payload.eventType === 'UPDATE') {
setAuctions((prev) =>
prev.map((a) => a.id === payload.new.id ? { ...a, ...payload.new } : a)
);
} else if (payload.eventType === 'INSERT') {
setAuctions((prev) => [...prev, payload.new]);
} else if (payload.eventType === 'DELETE') {
setAuctions((prev) => prev.filter((a) => a.id !== payload.old.id));
}
})
.subscribe();

return () => supabase.removeChannel(channel);
```

}, []);

const filtered = auctions.filter((a) => {
if (filter === ‘All’) return true;
if (filter === ‘Ending Soon’) {
return new Date(a.ends_at) - new Date() < 3600000;
}
return a.category === filter;
});

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

```
{/* Logo */}
<View style={styles.logoHeader}>
<Image source={require('./images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
</View>

{/* Header */}
<View style={styles.header}>
<View>
<View style={styles.titleRow}>
<View style={styles.liveIndicator}>
<View style={styles.livePulse} />
</View>
<Text style={styles.headerTitle}>Live Bidding</Text>
</View>
<Text style={styles.headerSub}>
{auctions.length > 0
? `${auctions.length} active auction${auctions.length > 1 ? 's' : ''}`
: 'Bid on exclusive pieces before they\'re gone'}
</Text>
</View>

<TouchableOpacity
style={styles.notifBtn}
activeOpacity={0.8}
onPress={() => navigation.navigate('CreateAuction')}
>
<Feather name="plus" size={20} color={COLORS.white} />
</TouchableOpacity>
</View>

{/* Filter pills */}
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
<Ionicons
name="flame-outline"
size={12}
color={filter === f ? COLORS.white : COLORS.live}
style={{ marginRight: 4 }}
/>
)}
<Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
</TouchableOpacity>
))}
</ScrollView>

{/* Auction grid */}
<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.scrollContent}
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={() => { setRefreshing(true); fetchAuctions(); }}
tintColor={COLORS.accent}
/>
}
>
{loading ? (
<View style={styles.loadingWrap}>
<MaterialCommunityIcons name="hammer" size={32} color={COLORS.accent} />
<Text style={styles.loadingText}>Loading auctions…</Text>
</View>
) : filtered.length === 0 ? (
<EmptyState />
) : (
<>
<Text style={styles.sectionLabel}>
{filter === 'All' ? 'Active Auctions' : filter} · {filtered.length} items
</Text>
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
```

);
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: COLORS.bg },
logoHeader: { paddingBottom: 10, alignItems: ‘center’, backgroundColor: COLORS.bg },
logo: { width: 120, height: 50 },

header: {
flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘space-between’,
paddingHorizontal: 20, marginBottom: 14,
},
titleRow: { flexDirection: ‘row’, alignItems: ‘center’, gap: 8, marginBottom: 3 },
liveIndicator: {
width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.liveLight,
alignItems: ‘center’, justifyContent: ‘center’,
},
livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.live },
headerTitle: { fontSize: 20, fontWeight: ‘700’, color: COLORS.accent },
headerSub: { fontSize: 13, color: COLORS.muted },
notifBtn: {
width: 40, height: 40, borderRadius: 12,
backgroundColor: COLORS.accent, alignItems: ‘center’, justifyContent: ‘center’,
},

filterRow: { paddingHorizontal: 16, paddingBottom: 14, alignItems: ‘center’, height: 52 },
filterPill: {
flexDirection: ‘row’, alignItems: ‘center’,
paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
marginRight: 8, alignSelf: ‘center’,
},
filterPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
filterText: { fontSize: 13, fontWeight: ‘600’, color: COLORS.muted },
filterTextActive: { color: COLORS.white },

scrollContent: { paddingBottom: 48 },
sectionLabel: {
fontSize: 11, fontWeight: ‘700’, color: COLORS.accent,
paddingHorizontal: 20, marginBottom: 12,
textTransform: ‘uppercase’, letterSpacing: 0.9,
},

grid: { flexDirection: ‘row’, flexWrap: ‘wrap’, paddingHorizontal: 12, gap: 12 },

auctionCard: {
width: CARD_W, backgroundColor: COLORS.white, borderRadius: 18,
overflow: ‘hidden’, shadowColor: COLORS.accent,
shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
shadowRadius: 8, elevation: 3, marginBottom: 4,
},
cardImageBox: {
height: 170, backgroundColor: COLORS.card,
alignItems: ‘center’, justifyContent: ‘center’,
},
cardImage: { width: ‘100%’, height: ‘100%’ },
liveBadge: {
position: ‘absolute’, top: 10, left: 10,
flexDirection: ‘row’, alignItems: ‘center’,
backgroundColor: COLORS.live, borderRadius: 8,
paddingHorizontal: 8, paddingVertical: 3, gap: 4,
},
liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.white },
liveText: { fontSize: 9, fontWeight: ‘800’, color: COLORS.white, letterSpacing: 0.5 },
categoryBadge: {
position: ‘absolute’, bottom: 10, right: 10,
backgroundColor: ‘rgba(255,255,255,0.9)’, borderRadius: 8,
paddingHorizontal: 8, paddingVertical: 3,
},
categoryBadgeText: { fontSize: 10, fontWeight: ‘700’, color: COLORS.accent },

cardInfo: { padding: 11 },
cardBrand: { fontSize: 10, fontWeight: ‘700’, color: COLORS.accent, textTransform: ‘uppercase’, letterSpacing: 0.4 },
cardTitle: { fontSize: 13, fontWeight: ‘700’, color: COLORS.text, marginTop: 2 },
cardBidLabel: { fontSize: 10, color: COLORS.muted, marginTop: 8 },
cardBid: { fontSize: 18, fontWeight: ‘800’, color: COLORS.accent },
cardFooter: { flexDirection: ‘row’, alignItems: ‘center’, justifyContent: ‘space-between’, marginTop: 8 },
timeTag: {
flexDirection: ‘row’, alignItems: ‘center’, gap: 3,
paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7,
},
timeText: { fontSize: 10, fontWeight: ‘700’ },
bidCountRow: { flexDirection: ‘row’, alignItems: ‘center’, gap: 3 },
bidCount: { fontSize: 10, color: COLORS.muted, fontWeight: ‘600’ },

emptyWrap: { alignItems: ‘center’, paddingTop: 60, paddingHorizontal: 32 },
emptyRing: {
width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card,
alignItems: ‘center’, justifyContent: ‘center’, marginBottom: 20,
},
emptyTitle: { fontSize: 18, fontWeight: ‘700’, color: COLORS.text, marginBottom: 8 },
emptySub: { fontSize: 14, color: COLORS.muted, textAlign: ‘center’, lineHeight: 20 },

loadingWrap: { alignItems: ‘center’, paddingTop: 80, gap: 12 },
loadingText: { fontSize: 14, color: COLORS.muted },
});
