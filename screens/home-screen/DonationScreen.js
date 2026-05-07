import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import {
  getWardrobeItems,
  getNearbyCenters,
  createDonation,
  getPointsGuide,
} from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#6abf7b', successLight: '#e8f5e9',
  gold: '#f9a825', goldLight: '#fff8e1',
};

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗',
  Shoes: '👟', Bags: '👜', Accessories: '✨', Outerwear: '🧥',
};

const CONDITION_STYLES = {
  'Like New': { bg: '#e8f5e9', text: '#388e3c' },
  'Good':     { bg: '#fff8e1', text: '#f9a825' },
  'Fair':     { bg: '#fce4ec', text: '#c2185b' },
};

const PointsBadge = ({ points }) => (
  <View style={styles.pointsBadge}>
    <Text style={styles.pointsStar}>⭐</Text>
    <Text style={styles.pointsValue}>{points}</Text>
    <Text style={styles.pointsLabel}>pts</Text>
  </View>
);

export default function DonationScreen({ navigation }) {
  const { getToken } = useAuth();

  const [wardrobeItems,  setWardrobeItems]  = useState([]);
  const [centers,        setCenters]        = useState([]);
  const [pointsGuide,    setPointsGuide]    = useState({ 'Like New': 50, 'Good': 30, 'Fair': 15 });
  const [userPoints,     setUserPoints]     = useState(0);
  const [selectedItems,  setSelectedItems]  = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [activeTab,      setActiveTab]      = useState('donate');
  const [submitted,      setSubmitted]      = useState(false);
  const [earnedPoints,   setEarnedPoints]   = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);

  // ── fetch wardrobe + points guide on mount ───────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const [wardrobeData, guideData] = await Promise.all([
          getWardrobeItems(token, 'All'),
          getPointsGuide(),
        ]);

        const items = wardrobeData.items ?? wardrobeData ?? [];
        setWardrobeItems(items.filter(i => !i.isDonated));

        const guide = guideData.data ?? guideData ?? {};
        if (Object.keys(guide).length > 0) setPointsGuide(guide);

      } catch (err) {
        console.error('Failed to init donation screen:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── fetch nearby centers when Centers tab is opened ──────────────
  const fetchCenters = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // fallback — fetch without location (backend returns all)
        const data = await getNearbyCenters(30.0444, 31.2357);
        setCenters(data.data ?? data ?? []);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const data = await getNearbyCenters(loc.coords.latitude, loc.coords.longitude);
      setCenters(data.data ?? data ?? []);
    } catch (err) {
      console.error('Failed to fetch centers:', err.message);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'centers' && centers.length === 0) {
      fetchCenters();
    }
  }, [activeTab]);

  // ── helpers ──────────────────────────────────────────────────────
  const toggleItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getPoints = (condition) => {
    // backend uses lowercase keys, frontend uses title case
    return pointsGuide[condition]
      || pointsGuide[condition?.toLowerCase()]
      || pointsGuide['good']
      || 30;
  };

  const totalPointsToEarn = selectedItems.reduce((sum, id) => {
    const item = wardrobeItems.find(w => w._id === id);
    return sum + (item ? getPoints(item.condition) : 0);
  }, 0);

  // ── submit ───────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please select at least one item to donate.');
      return;
    }
    if (!selectedCenter) {
      Alert.alert('No center selected', 'Please go to the Centers tab and select a donation center.');
      return;
    }

    Alert.alert(
      'Confirm Donation',
      `Donate ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} to ${selectedCenter.name} and earn ${totalPointsToEarn} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate & Earn Points',
          onPress: async () => {
            try {
              setSubmitting(true);
              const token = await getToken();
              const data = await createDonation(token, selectedCenter._id, selectedItems);
              const earned = data.data?.totalPointsEarned ?? totalPointsToEarn;
              setEarnedPoints(earned);
              setSubmitted(true);
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ── success screen ───────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Donation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.successScreen}>
          <View style={styles.successIconWrap}>
            <Ionicons name="heart" size={52} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>Thank you! 🎉</Text>
          <Text style={styles.successSub}>
            Your {selectedItems.length} item{selectedItems.length > 1 ? 's have' : ' has'} been marked for donation.
          </Text>
          <View style={styles.pointsEarnedCard}>
            <Text style={styles.pointsEarnedEmoji}>⭐</Text>
            <Text style={styles.pointsEarnedValue}>+{earnedPoints}</Text>
            <Text style={styles.pointsEarnedLabel}>points earned!</Text>
            <Text style={styles.pointsEarnedTotal}>New balance: {userPoints + earnedPoints} pts</Text>
          </View>
          <View style={styles.pointsInfoCard}>
            <Text style={styles.pointsInfoTitle}>Use your points for</Text>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Discounts on marketplace items</Text>
            </View>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="hammer-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Bid boosts in live auctions</Text>
            </View>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="star-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Exclusive FASH rewards</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── main screen ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Donation</Text>
          <Text style={styles.headerSub}>Give back · Earn points</Text>
        </View>
        <PointsBadge points={userPoints} />
      </View>

      <View style={styles.pointsBanner}>
        <Text style={styles.pointsBannerEmoji}>⭐</Text>
        <View style={styles.pointsBannerText}>
          <Text style={styles.pointsBannerTitle}>Earn points for every donation</Text>
          <Text style={styles.pointsBannerSub}>
            Like New = {pointsGuide['Like New'] ?? 50}pts · Good = {pointsGuide['Good'] ?? pointsGuide['good'] ?? 30}pts · Fair = {pointsGuide['Fair'] ?? pointsGuide['fair'] ?? 15}pts
          </Text>
        </View>
      </View>

      {selectedCenter && (
        <View style={styles.selectedCenterBanner}>
          <Ionicons name="location" size={14} color={COLORS.accent} />
          <Text style={styles.selectedCenterText}>Donating to: {selectedCenter.name}</Text>
          <TouchableOpacity onPress={() => setSelectedCenter(null)}>
            <Ionicons name="close-circle" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'donate' && styles.tabActive]}
          onPress={() => setActiveTab('donate')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-outline" size={15} color={activeTab === 'donate' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'donate' && styles.tabTextActive]}>My Items</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'centers' && styles.tabActive]}
          onPress={() => setActiveTab('centers')}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={15} color={activeTab === 'centers' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'centers' && styles.tabTextActive]}>Centers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeTab === 'donate' ? (
          loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
          ) : wardrobeItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No wardrobe items</Text>
              <Text style={styles.emptySub}>Add items to your wardrobe first to donate them.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionLabel}>
                Select items to donate · {wardrobeItems.length} in wardrobe
              </Text>
              {wardrobeItems.map(item => {
                const isSelected = selectedItems.includes(item._id);
                const pts = getPoints(item.condition);
                const condStyle = CONDITION_STYLES[item.condition] ?? CONDITION_STYLES['Good'];
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                    onPress={() => toggleItem(item._id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.itemEmoji, isSelected && styles.itemEmojiSelected]}>
                      <Text style={styles.itemEmojiText}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>{[item.brand, item.size].filter(Boolean).join(' · ')}</Text>
                      <View style={styles.itemTagRow}>
                        <View style={[styles.conditionTag, { backgroundColor: condStyle.bg }]}>
                          <Text style={[styles.conditionText, { color: condStyle.text }]}>{item.condition}</Text>
                        </View>
                        <View style={styles.pointsTag}>
                          <Text style={styles.pointsTagText}>+{pts} pts</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )
        ) : (
          centers.length === 0 ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
          ) : (
            <>
              <Text style={styles.sectionLabel}>
                Donation Centers Near You · {centers.length} found
              </Text>
              {centers.map(center => (
                <TouchableOpacity
                  key={center._id}
                  style={[styles.centerCard, selectedCenter?._id === center._id && styles.centerCardSelected]}
                  onPress={() => { setSelectedCenter(center); setActiveTab('donate'); }}
                  activeOpacity={0.88}
                >
                  <View style={styles.centerHeader}>
                    <View style={styles.centerIconWrap}>
                      <Ionicons name="location" size={20} color={COLORS.accent} />
                    </View>
                    <View style={styles.centerInfo}>
                      <View style={styles.centerTitleRow}>
                        <Text style={styles.centerName}>{center.name}</Text>
                        {center.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={10} color={COLORS.white} />
                            <Text style={styles.verifiedText}>Verified</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.centerAddress}>{center.address}, {center.city}</Text>
                    </View>
                  </View>
                  <View style={styles.centerDetails}>
                    {center.hours && (
                      <View style={styles.centerDetailRow}>
                        <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                        <Text style={styles.centerDetailText}>{center.hours}</Text>
                      </View>
                    )}
                    {center.phone && (
                      <View style={styles.centerDetailRow}>
                        <Ionicons name="call-outline" size={13} color={COLORS.muted} />
                        <Text style={styles.centerDetailText}>{center.phone}</Text>
                      </View>
                    )}
                  </View>
                  {center.acceptedItems?.length > 0 && (
                    <View style={styles.acceptsRow}>
                      {center.acceptedItems.map(a => (
                        <View key={a} style={styles.acceptTag}>
                          <Text style={styles.acceptTagText}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.directionsBtn, selectedCenter?._id === center._id && { backgroundColor: COLORS.success }]}
                    onPress={() => { setSelectedCenter(center); setActiveTab('donate'); }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name={selectedCenter?._id === center._id ? 'checkmark' : 'navigate-outline'} size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.directionsBtnText}>
                      {selectedCenter?._id === center._id ? 'Selected' : 'Select This Center'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          )
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {activeTab === 'donate' && (
        <View style={styles.submitBar}>
          <View style={styles.submitBarLeft}>
            <Text style={styles.submitBarCount}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Text>
            {totalPointsToEarn > 0 && (
              <Text style={styles.submitBarPoints}>⭐ +{totalPointsToEarn} pts</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, (selectedItems.length === 0 || submitting) && { opacity: 0.4 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="heart-outline" size={15} color={COLORS.white} style={{ marginRight: 6 }} />
            )}
            <Text style={styles.submitBtnText}>{submitting ? 'Donating...' : 'Donate'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: COLORS.bg },
  logoHeader:           { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo:                 { width: 120, height: 50 },
  topNav:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn:               { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle:             { fontSize: 16, fontWeight: '700', color: COLORS.text },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  headerTitle:          { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub:            { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  pointsBadge:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.goldLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsStar:           { fontSize: 14 },
  pointsValue:          { fontSize: 16, fontWeight: '800', color: COLORS.gold },
  pointsLabel:          { fontSize: 11, color: COLORS.gold, fontWeight: '600' },
  pointsBanner:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.goldLight, marginHorizontal: 16, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsBannerEmoji:    { fontSize: 24 },
  pointsBannerText:     { flex: 1 },
  pointsBannerTitle:    { fontSize: 13, fontWeight: '700', color: '#7a5c00' },
  pointsBannerSub:      { fontSize: 11, color: '#a07830', marginTop: 2 },
  selectedCenterBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.accentLight, marginHorizontal: 16, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  selectedCenterText:   { flex: 1, fontSize: 12, fontWeight: '600', color: COLORS.accent },
  tabRow:               { flexDirection: 'row', marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab:                  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive:            { backgroundColor: COLORS.accent },
  tabText:              { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  tabTextActive:        { color: COLORS.white },
  scrollContent:        { paddingHorizontal: 16, paddingBottom: 20 },
  sectionLabel:         { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12 },
  emptyState:           { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle:           { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptySub:             { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  itemRow:              { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  itemRowSelected:      { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  itemEmoji:            { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  itemEmojiSelected:    { backgroundColor: COLORS.white },
  itemEmojiText:        { fontSize: 24 },
  itemInfo:             { flex: 1 },
  itemName:             { fontSize: 14, fontWeight: '700', color: COLORS.text },
  itemMeta:             { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  itemTagRow:           { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  conditionTag:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  conditionText:        { fontSize: 10, fontWeight: '700' },
  pointsTag:            { backgroundColor: COLORS.goldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  pointsTagText:        { fontSize: 10, fontWeight: '700', color: COLORS.gold },
  checkbox:             { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected:     { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  centerCard:           { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  centerCardSelected:   { borderColor: COLORS.accent, borderWidth: 2 },
  centerHeader:         { flexDirection: 'row', gap: 12, marginBottom: 12 },
  centerIconWrap:       { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  centerInfo:           { flex: 1 },
  centerTitleRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  centerName:           { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  verifiedBadge:        { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.accent, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText:         { fontSize: 9, fontWeight: '700', color: COLORS.white },
  centerAddress:        { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  centerDetails:        { gap: 6, marginBottom: 12 },
  centerDetailRow:      { flexDirection: 'row', alignItems: 'center', gap: 7 },
  centerDetailText:     { fontSize: 12, color: COLORS.muted },
  acceptsRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  acceptTag:            { backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  acceptTagText:        { fontSize: 11, fontWeight: '600', color: COLORS.accent },
  directionsBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12 },
  directionsBtnText:    { fontSize: 13, fontWeight: '700', color: COLORS.white },
  submitBar:            { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBarLeft:        { gap: 2 },
  submitBarCount:       { fontSize: 13, fontWeight: '700', color: COLORS.text },
  submitBarPoints:      { fontSize: 12, fontWeight: '700', color: COLORS.gold },
  submitBtn:            { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  submitBtnText:        { fontSize: 14, fontWeight: '700', color: COLORS.white },
  successScreen:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIconWrap:      { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle:         { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  successSub:           { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  pointsEarnedCard:     { alignItems: 'center', backgroundColor: COLORS.goldLight, borderRadius: 20, padding: 24, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsEarnedEmoji:    { fontSize: 36, marginBottom: 6 },
  pointsEarnedValue:    { fontSize: 48, fontWeight: '900', color: COLORS.gold },
  pointsEarnedLabel:    { fontSize: 16, fontWeight: '700', color: '#7a5c00', marginTop: 4 },
  pointsEarnedTotal:    { fontSize: 13, color: '#a07830', marginTop: 8 },
  pointsInfoCard:       { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, width: '100%', marginBottom: 24, gap: 10 },
  pointsInfoTitle:      { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  pointsInfoRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsInfoText:       { fontSize: 13, color: COLORS.muted },
  doneBtn:              { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  doneBtnText:          { fontSize: 15, fontWeight: '700', color: COLORS.white },
});