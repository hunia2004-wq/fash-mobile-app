import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, TextInput, KeyboardAvoidingView,
  Platform, Animated, Alert, Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabaseClient';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentLight: '#f7edec',
  accentDark: '#a8635c',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  iconBg: '#e3c8c5',
  live: '#E05C5C',
  liveLight: '#fdecea',
  success: '#6abf7b',
};

const QUICK_BIDS = [5, 10, 25, 50];

const useCountdown = (endsAt) => {
  const calc = () => {
    const diff = new Date(endsAt) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0, ended: true, urgent: false };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, ended: false, urgent: diff < 300000 };
  };

  const [time, setTime] = useState(calc());

  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return time;
};

const CountdownBlock = ({ value, label, urgent }) => (
  <View style={[styles.countBlock, urgent && { backgroundColor: COLORS.liveLight }]}>
    <Text style={[styles.countValue, urgent && { color: COLORS.live }]}>
      {String(value).padStart(2, '0')}
    </Text>
    <Text style={[styles.countLabel, urgent && { color: COLORS.live }]}>
      {label}
    </Text>
  </View>
);

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
        <Text style={styles.bidAvatarText}>
          {(bid.user_name || '?').charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.bidInfo}>
        <Text style={styles.bidName}>
          {isCurrentUser ? 'You' : bid.user_name}
          {isTop && <Text style={styles.topBidLabel}> · Highest</Text>}
        </Text>
        <Text style={styles.bidTime}>
          {new Date(bid.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <Text style={[styles.bidAmount, isTop && { color: COLORS.accent }]}>
        ${Number(bid.amount).toFixed(0)}
      </Text>
    </Animated.View>
  );
};

export default function AuctionRoomScreen({ navigation, route }) {
  const { auctionId } = route.params;

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidInput, setBidInput] = useState('');
  const [placing, setPlacing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [successAnim] = useState(new Animated.Value(0));

  const scrollRef = useRef(null);
  const countdown = useCountdown(auction?.ends_at ?? new Date().toISOString());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: auctionData } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

      if (auctionData) setAuction(auctionData);

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (bidsData) setBids(bidsData);
    };

    fetchData();

    const bidsChannel = supabase
      .channel(`bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        (payload) => {
          setBids((prev) => [payload.new, ...prev]);
          setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
    };
  }, [auctionId]);

  const placeBid = async (amount) => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please log in.');
      return;
    }

    const bidAmount = parseFloat(amount || bidInput);

    if (!bidAmount || bidAmount <= Number(auction.current_bid)) {
      Alert.alert('Invalid bid');
      return;
    }

    setPlacing(true);

    await supabase.rpc('place_bid', {
      p_auction_id: auctionId,
      p_user_id: currentUser.id,
      p_user_name: currentUser.email,
      p_amount: bidAmount,
    });

    setPlacing(false);
    setBidInput('');
  };

  if (!auction) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageBox}>
          {auction.image_url ? (
            <Image source={{ uri: auction.image_url }} style={styles.itemImage} />
          ) : (
            <MaterialCommunityIcons name="hanger" size={60} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.itemTitle}>{auction.title}</Text>
          <Text style={styles.currentBid}>
            ${Number(auction.current_bid).toFixed(0)}
          </Text>
        </View>

        {bids.map((bid, i) => (
          <BidRow
            key={bid.id}
            bid={bid}
            isTop={i === 0}
            isCurrentUser={currentUser && bid.user_id === currentUser.id}
          />
        ))}
      </ScrollView>

      <View style={styles.bidBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickBidsRow}
        >
          {QUICK_BIDS.map((inc) => (
            <TouchableOpacity
              key={inc}
              style={styles.quickBidBtn}
              onPress={() =>
                placeBid(Number(auction.current_bid) + inc)
              }
            >
              <Text style={styles.quickBidText}>+${inc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bidInputRow}>
          <TextInput
            style={styles.bidInput}
            placeholder="Enter bid"
            keyboardType="numeric"
            value={bidInput}
            onChangeText={setBidInput}
          />

          <TouchableOpacity style={styles.placeBidBtn} onPress={() => placeBid()}>
            <Text style={{ color: 'white' }}>Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingBottom: 140 },

  imageBox: {
    width: width,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemImage: { width: '100%', height: '100%' },

  section: { padding: 20 },

  itemTitle: { fontSize: 20, fontWeight: 'bold' },

  currentBid: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C17C74',
    marginTop: 10,
  },

  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 10,
  },

  bidBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    paddingBottom: 20,
  },

  quickBidsRow: {
    flexDirection: 'row',
    padding: 10,
  },

  quickBidBtn: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
  },

  quickBidText: { fontWeight: 'bold' },

  bidInputRow: {
    flexDirection: 'row',
    padding: 10,
  },

  bidInput: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },

  placeBidBtn: {
    backgroundColor: '#C17C74',
    padding: 15,
    borderRadius: 10,
  },
});