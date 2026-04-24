import React, { useState, useEffect } from 'react';
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
bg: '#F5F5F5',
card: '#F2E6E3',
accent: '#C17C74',
accentLight: '#f7edec',
text: '#2c2c2c',
muted: '#888888',
white: '#ffffff',
border: 'rgba(193,124,116,0.18)',
live: '#E05C5C',
liveLight: '#fdecea',
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
<TouchableOpacity style={styles.auctionCard} onPress={onPress}>
<View style={styles.cardImageBox}>
{auction.image_url ? (
<Image source={{ uri: auction.image_url }} style={styles.cardImage} />
) : (
<MaterialCommunityIcons name="hanger" size={36} color={COLORS.accent} />
)}

{!countdown.ended && (
<View style={styles.liveBadge}>
<Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
<Text style={styles.liveText}>LIVE</Text>
</View>
)}
</View>

<View style={styles.cardInfo}>
<Text style={styles.cardTitle}>{auction.title}</Text>
<Text style={styles.cardBid}>${Number(auction.current_bid).toFixed(0)}</Text>
<Text style={styles.timeText}>{countdown.label}</Text>
</View>
</TouchableOpacity>
);
};

export default function AuctionListScreen({ navigation }) {
const [auctions, setAuctions] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);

const fetchAuctions = async () => {
const { data } = await supabase
.from('auctions')
.select('*')
.eq('status', 'active');

if (data) setAuctions(data);

setLoading(false);
setRefreshing(false);
};

useEffect(() => {
fetchAuctions();
}, []);

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle="dark-content" />

<ScrollView
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={() => {
setRefreshing(true);
fetchAuctions();
}}
/>
}
>
<View style={styles.grid}>
{auctions.map((auction) => (
<AuctionCard
key={auction.id}
auction={auction}
onPress={() => navigation.navigate('AuctionRoom')}
/>
))}
</View>
</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: COLORS.bg },

grid: {
flexDirection: 'row',
flexWrap: 'wrap',
padding: 12,
gap: 12,
},

auctionCard: {
width: CARD_W,
backgroundColor: '#fff',
borderRadius: 16,
overflow: 'hidden',
},

cardImageBox: {
height: 150,
backgroundColor: COLORS.card,
alignItems: 'center',
justifyContent: 'center',
},

cardImage: {
width: '100%',
height: '100%',
},

liveBadge: {
position: 'absolute',
top: 10,
left: 10,
backgroundColor: COLORS.live,
paddingHorizontal: 6,
paddingVertical: 2,
borderRadius: 6,
flexDirection: 'row',
alignItems: 'center',
},

liveDot: {
width: 6,
height: 6,
backgroundColor: '#fff',
borderRadius: 3,
marginRight: 4,
},

liveText: {
color: '#fff',
fontSize: 10,
},

cardInfo: {
padding: 10,
},

cardTitle: {
fontWeight: '700',
},

cardBid: {
color: COLORS.accent,
fontWeight: '800',
marginTop: 4,
},

timeText: {
fontSize: 12,
color: COLORS.muted,
marginTop: 4,
},
});
