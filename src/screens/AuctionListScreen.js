import React, { useState, useEffect, useCallback } from 'react';
import {
View, Text, ScrollView, StyleSheet, TouchableOpacity,
StatusBar, Image, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabaseClient';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

const COLORS = {
bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
white: '#ffffff', border: 'rgba(193,124,116,0.18)',
iconBg: '#e3c8c5', live: '#E05C5C', liveLight: '#fdecea',
success: '#6abf7b',
};

const useCountdown = (endsAt) => {
const calc = () => {
const diff = new Date(endsAt) - new Date();
if (diff <= 0) return { label: 'Ended', urgent: false, ended: true };
const h = Math.floor(diff / 3600000);
const m = Math.floor((diff % 3600000) / 60000);
const s = Math.floor((diff % 60000) / 1000);
const urgent = diff < 600000;
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
<View style={styles.cardImageBox}>
{auction.image_url ? (
<Image source={{ uri: auction.image_url }} style={styles.cardImage} resizeMode="cover" />
) : (
<MaterialCommunityIcons name="hanger" size={36} color={COLORS.accent} />
)}

{!countdown.ended && (
<View style={styles.liveBadge}>
<Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
<Text style={styles.liveText}>LIVE</Text>
</View>
)}

<View style={styles.categoryBadge}>
<Text style={styles.categoryBadgeText}>{auction.category}</Text>
</View>
</View>

<View style={styles.cardInfo}>
<Text style={styles.cardBrand}>{auction.brand}</Text>
<Text style={styles.cardTitle} numberOfLines={1}>{auction.title}</Text>

<Text style={styles.cardBidLabel}>Current bid</Text>
<Text style={styles.cardBid}>${Number(auction.current_bid).toFixed(0)}</Text>

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
);
};


export default function AuctionListScreen({ navigation }) {
const [auctions, setAuctions] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [filter, setFilter] = useState('All');

const FILTERS = ['All', 'Ending Soon', 'Shoes', 'Bags', 'Accessories', 'Tops'];

const fetchAuctions = async () => {
const { data, error } = await supabase
.from('auctions')
.select('*')
.eq('status', 'active')
.gt('ends_at', new Date().toISOString())
.order('ends_at', { ascending: true });

if (!error && data) setAuctions(data);
setLoading(false);
setRefreshing(false);
};

useEffect(() => {
fetchAuctions();

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

}, []);

const filtered = auctions.filter((a) => {
if (filter === 'All') return true;
if (filter === 'Ending Soon') {
return new Date(a.ends_at) - new Date() < 3600000;
}
return a.category === filter;
});

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

<View style={styles.logoHeader}>
<Image source={require('./images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
</View>

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
: "Bid on exclusive pieces before they're gone"}
</Text>
</View>

<TouchableOpacity
style={styles.notifBtn}
onPress={() => navigation.navigate('CreateAuction')}
>
<Feather name="plus" size={20} color={COLORS.white} />
</TouchableOpacity>
</View>
