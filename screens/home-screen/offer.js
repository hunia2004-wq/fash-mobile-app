import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getMyListingOffers, respondToOffer } from '../../services/authService';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  text: '#2c2c2c', muted: '#888', white: '#fff',
  border: 'rgba(193,124,116,0.18)',
};

export default function SellerOffersScreen({ navigation, route }) {
  const { listingId, listingTitle } = route.params ?? {};
  const { getToken } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setLoading(true);
          const token = await getToken();
          const data = await getMyListingOffers(token, listingId);
          setOffers(data.offers ?? data ?? []);
        } catch (err) {
          Alert.alert('Error', err.message);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [listingId])
  );

  const handleRespond = async (offerId, status) => {
    try {
      setResponding(offerId);
      const token = await getToken();
      await respondToOffer(token, listingId, offerId, status);
      setOffers(prev => prev.map(o =>
        o._id === offerId ? { ...o, status } : o
      ));
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setResponding(null);
    }
  };

  const renderOffer = ({ item: offer }) => {
    const isPending = offer.status === 'pending';
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.buyerName}>{offer.buyerName}</Text>
            <Text style={styles.offerDate}>
              {new Date(offer.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, {
            backgroundColor: offer.status === 'accepted' ? '#D1FAE5'
              : offer.status === 'rejected' ? '#FEE2E2' : '#FEF3C7'
          }]}>
            <Text style={[styles.statusText, {
              color: offer.status === 'accepted' ? '#065F46'
                : offer.status === 'rejected' ? '#991B1B' : '#92400E'
            }]}>
              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Listed at</Text>
            <Text style={styles.listedPrice}>EGP {offer.listingPrice}</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color={COLORS.muted} />
          <View>
            <Text style={styles.priceLabel}>Offer</Text>
            <Text style={styles.offerPrice}>EGP {offer.offerPrice}</Text>
          </View>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsText}>
              -{Math.round((1 - offer.offerPrice / offer.listingPrice) * 100)}%
            </Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.rejectBtn, responding === offer._id && { opacity: 0.5 }]}
              onPress={() => handleRespond(offer._id, 'rejected')}
              disabled={!!responding}
              activeOpacity={0.85}
            >
              {responding === offer._id
                ? <ActivityIndicator size="small" color={COLORS.accent} />
                : <Text style={styles.rejectBtnText}>Decline</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, responding === offer._id && { opacity: 0.5 }]}
              onPress={() => handleRespond(offer._id, 'accepted')}
              disabled={!!responding}
              activeOpacity={0.85}
            >
              {responding === offer._id
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Text style={styles.acceptBtnText}>Accept</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={{ width: 40 }} />
      </View>

      {listingTitle && (
        <Text style={styles.listingTitle} numberOfLines={1}>{listingTitle}</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ flex: 1 }} />
      ) : offers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pricetag-outline" size={48} color={COLORS.card} />
          <Text style={styles.emptyTitle}>No offers yet</Text>
          <Text style={styles.emptySub}>Offers on this listing will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={o => o._id}
          renderItem={renderOffer}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  listingTitle: { fontSize: 13, color: COLORS.muted, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  buyerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  offerDate: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  priceLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  listedPrice: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  offerPrice: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  savingsPill: { backgroundColor: '#fce4ec', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 'auto' },
  savingsText: { fontSize: 11, fontWeight: '700', color: '#c2185b' },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  acceptBtn: { flex: 1, backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.muted },
});