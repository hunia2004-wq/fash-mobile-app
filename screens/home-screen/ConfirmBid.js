import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  text: '#2c2c2c', muted: '#888888', white: '#ffffff',
  success: '#388e3c', successLight: '#e8f5e9',
};

export default function ConfirmBid({ navigation, route }) {
  const { bid, auctionTitle, auctionId } = route?.params ?? {};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* Success icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Bid Placed!</Text>
        <Text style={styles.sub}>You placed a bid on</Text>
        {auctionTitle && <Text style={styles.auctionName}>{auctionTitle}</Text>}

        {/* Bid amount */}
        <View style={styles.bidCard}>
          <Text style={styles.bidLabel}>Your bid</Text>
          <Text style={styles.bidAmount}>${bid}</Text>
        </View>

        <Text style={styles.note}>
          You'll be notified if you're outbid or if you win the auction.
        </Text>

        {/* Actions */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('AuctionListScreen', { auctionId })}
          activeOpacity={0.85}
        >
          <Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.btnPrimaryText}>Back to Auction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('AuctionListScreen')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Browse More Auctions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg },
  container:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  iconWrap:       { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:          { fontSize: 28, fontWeight: '900', color: COLORS.text },
  sub:            { fontSize: 15, color: COLORS.muted },
  auctionName:    { fontSize: 16, fontWeight: '700', color: COLORS.accent, textAlign: 'center' },
  bidCard:        { backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 40, paddingVertical: 20, alignItems: 'center', marginVertical: 8 },
  bidLabel:       { fontSize: 12, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bidAmount:      { fontSize: 40, fontWeight: '900', color: COLORS.accent, marginTop: 4 },
  note:           { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  btnPrimary:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, width: '100%' },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  btnOutline:     { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 16, paddingVertical: 15, width: '100%' },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
});