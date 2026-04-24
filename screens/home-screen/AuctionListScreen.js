import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, RefreshControl, Dimensions, Animated
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

/* ---------------- COUNTDOWN ---------------- */
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

  const [time, setTime] = useState(calc());

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return time;
};

/* ---------------- CARD ---------------- */
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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageBox}>
        {auction.image_url ? (
          <Image source={{ uri: auction.image_url }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="hanger" size={30} color={COLORS.accent} />
        )}

        {!countdown.ended && (
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <Text style={styles.brand}>{auction.brand}</Text>
      <Text numberOfLines={1}>{auction.title}</Text>

      <Text style={styles.bid}>${Number(auction.current_bid).toFixed(0)}</Text>

      <Text style={{ fontSize: 12, color: COLORS.accent }}>
        {countdown.label}
      </Text>
    </TouchableOpacity>
  );
};

/* ---------------- SCREEN ---------------- */
export default function AuctionListScreen({ navigation }) {
  const [auctions, setAuctions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAuctions = async () => {
    const { data } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .order('ends_at', { ascending: true });

    if (data) setAuctions(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAuctions();

    const channel = supabase
      .channel('auction-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setAuctions((prev) =>
            prev.map((a) => a.id === payload.new.id ? payload.new : a)
          );
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Live Bidding</Text>

        <TouchableOpacity onPress={() => navigation.navigate('CreateAuction')}>
          <Feather name="plus" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchAuctions();
          }} />
        }
      >
        <View style={styles.grid}>
          {auctions.map((item) => (
            <AuctionCard
              key={item.id}
              auction={item}
              onPress={() => navigation.navigate('AuctionDetails', { id: item.id })}
            />
          ))}
        </View>

        {auctions.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No active auctions
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  card: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12
  },

  imageBox: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10
  },

  brand: {
    fontWeight: 'bold',
    marginTop: 6
  },

  bid: {
    color: '#C17C74',
    fontWeight: 'bold'
  },

  liveBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'red',
    marginRight: 4
  },

  liveText: {
    fontSize: 10,
    color: 'red'
  }
});