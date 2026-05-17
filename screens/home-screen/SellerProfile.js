import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import {
  getSellerProfile, toggleFollowSeller, getSellerReviews,
} from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', primary: '#C17C74',
  dark: '#2C1F1F', muted: '#9e8e8e', textBody: '#5c4a4a',
  white: '#ffffff', border: 'rgba(193,124,116,0.15)',
};

const BADGE_ICONS = {
  'Top Seller': 'star', 'Trusted': 'shield-checkmark',
  'Fast Shipper': 'time', 'Eco Friendly': 'leaf',
};

const StarRow = ({ rating, size = 13 }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1,2,3,4,5].map(s => (
      <Ionicons
        key={s}
        name={s <= Math.round(rating) ? 'star' : 'star-outline'}
        size={size}
        color={COLORS.primary}
      />
    ))}
  </View>
);

const Avatar = ({ uri, initials, size = 76 }) => (
  <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    ) : (
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
    )}
  </View>
);

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Divider = ({ vertical }) =>
  vertical ? <View style={styles.vertDivider} /> : <View style={styles.horizDivider} />;

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={styles.ratingBarRow}>
      <Text style={styles.ratingBarStar}>{star}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.ratingBarPct}>{pct}%</Text>
    </View>
  );
};

const Badge = ({ label }) => (
  <View style={styles.badge}>
    <Ionicons name={BADGE_ICONS[label] ?? 'ribbon'} size={13} color={COLORS.primary} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const ReviewCard = ({ item }) => {
  const reviewer = item.reviewer ?? {};
  const initials = `${reviewer.firstName?.[0] ?? ''}${reviewer.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewLeft}>
          <View style={styles.reviewAvatar}>
            {reviewer.avatar
              ? <Image source={{ uri: reviewer.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              : <Text style={styles.reviewAvatarText}>{initials}</Text>
            }
          </View>
          <View>
            <Text style={styles.reviewName}>{reviewer.firstName} {reviewer.lastName}</Text>
            <Text style={styles.reviewTime}>
              {new Date(item.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <StarRow rating={item.rating} size={11} />
      </View>
      {item.comment && <Text style={styles.reviewText}>{item.comment}</Text>}
      {item.itemName && (
        <View style={styles.reviewProduct}>
          {item.itemImage
            ? <Image source={{ uri: item.itemImage }} style={styles.reviewProductThumb} />
            : <View style={styles.reviewProductThumb} />
          }
          <Text style={styles.reviewProductName}>{item.itemName}</Text>
        </View>
      )}
    </View>
  );
};

export default function SellerProfileScreen({ navigation, route }) {
  const { sellerId } = route.params ?? {};
  const { getToken } = useAuth();

  const [seller,        setSeller]        = useState(null);
  const [reviews,       setReviews]       = useState([]);
  const [followed,      setFollowed]      = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error,         setError]         = useState(null);

  // Ref to block fetchData from overwriting state during a follow action
  const isFollowingRef = useRef(false);

  const fetchData = async () => {
    if (!sellerId) { setError('Seller not found.'); setLoading(false); return; }
    try {
      setLoading(true);
      const token = await getToken();
      const [profileData, reviewsData] = await Promise.all([
        getSellerProfile(token, sellerId),
        getSellerReviews(token, sellerId),
      ]);

      console.log('profileData:', JSON.stringify(profileData, null, 2)); // ADD THIS

      const s          = profileData.seller ?? profileData;
      const isFollowing = profileData.isFollowing ?? false;
      setSeller(s);
      // Only update followed state from fetch if no follow action is in progress
      if (!isFollowingRef.current) {
        setFollowed(isFollowing);
      }
      setReviews(reviewsData.data?.reviews ?? reviewsData.reviews ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run only once on mount — no dependency array that could re-trigger
  useEffect(() => { fetchData(); }, [sellerId]);

  // Replace handleToggleFollow with this:
const handleToggleFollow = async () => {
  // Prevent any action while already loading
  if (followLoading) return;

  const prevFollowed = followed;
  const prevCount    = seller?.followersCount ?? 0;
  const newFollowed  = !prevFollowed;

  isFollowingRef.current = true;
  setFollowLoading(true);

  // Optimistic update
  setFollowed(newFollowed);
  setSeller(prev => ({
    ...prev,
    followersCount: newFollowed ? prevCount + 1 : Math.max(0, prevCount - 1),
  }));

  try {
    const token = await getToken();
    const data  = await toggleFollowSeller(token, sellerId);
    setFollowed(data.isFollowing);
    setSeller(prev => ({ ...prev, followersCount: data.followersCount }));
  } catch (err) {
    setFollowed(prevFollowed);
    setSeller(prev => ({ ...prev, followersCount: prevCount }));
    Alert.alert('Error', err.message);
  } finally {
    setFollowLoading(false);
    isFollowingRef.current = false;
  }
};

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (error || !seller) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Seller Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error ?? 'Seller not found'}</Text>
          <TouchableOpacity onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const user         = seller.user ?? {};
  const initials     = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '??';
  const breakdown    = seller.ratingBreakdown ?? {};
  const totalReviews = seller.totalReviews ?? 0;

  const categories = [
    { label: 'Quality',       score: seller.qualityRating },
    { label: 'Shipping',      score: seller.shippingRating },
    { label: 'Communication', score: seller.communicationRating },
    { label: 'As Described',  score: seller.asDescribedRating },
  ].filter(c => c.score > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Seller Profile</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile header */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Avatar uri={user.avatar} initials={initials} size={76} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.sellerName}>{user.firstName} {user.lastName}</Text>
                {seller.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                )}
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>Fashion Seller</Text>
              </View>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            </View>
          </View>

          <Divider />
          <View style={styles.statsRow}>
            <StatItem value={seller.totalListings} label="Listings" />
            <Divider vertical />
            <StatItem value={seller.totalSales} label="Sales" />
            <Divider vertical />
            <StatItem value={seller.followersCount} label="Followers" />
            <Divider vertical />
            <StatItem value={seller.responseRate ? `${seller.responseRate}%` : '—'} label="Response" />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, followed && styles.btnPrimaryFollowed]}
            onPress={handleToggleFollow}
            disabled={followLoading}
            activeOpacity={0.85}
          >
            {followLoading
              ? <ActivityIndicator size="small" color={followed ? COLORS.primary : COLORS.white} />
              : <Text style={[styles.btnPrimaryText, followed && { color: COLORS.primary }]}>
                  {followed ? 'Following' : 'Follow'}
                </Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.85}>
            <Text style={styles.btnOutlineText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnIcon} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={19} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Ratings */}
        {totalReviews > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
            <View style={styles.ratingMain}>
              <View style={styles.ratingScore}>
                <Text style={styles.ratingBig}>{seller.averageRating?.toFixed(1) ?? '—'}</Text>
                <StarRow rating={seller.averageRating ?? 0} size={13} />
                <Text style={styles.ratingCount}>{totalReviews} reviews</Text>
              </View>
              <View style={styles.ratingBars}>
                {[5,4,3,2,1].map(star => (
                  <RatingBar key={star} star={star} count={breakdown[star] ?? 0} total={totalReviews} />
                ))}
              </View>
            </View>
            {categories.length > 0 && (
              <>
                <Divider />
                <View style={styles.catRow}>
                  {categories.map(c => (
                    <View key={c.label} style={styles.catItem}>
                      <Text style={styles.catScore}>{c.score?.toFixed(1)}</Text>
                      <Text style={styles.catLabel}>{c.label}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Badges */}
        {seller.badges?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <View style={styles.badgeRow}>
              {seller.badges.map(b => <Badge key={b} label={b} />)}
            </View>
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginHorizontal: 4, marginBottom: 10 }]}>
              Recent Reviews
            </Text>
            {reviews.map(r => <ReviewCard key={r._id} item={r} />)}
            <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.85}>
              <Text style={styles.viewAllText}>View all {totalReviews} reviews</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:           { flex: 1, backgroundColor: COLORS.bg },
  centered:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:          { color: COLORS.muted, fontSize: 14, marginBottom: 12 },
  retryText:          { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  topNav:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.bg },
  navTitle:           { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  iconBtn:            { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  scroll:             { flex: 1 },
  scrollContent:      { paddingHorizontal: 16, paddingTop: 4 },
  card:               { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  avatarCircle:       { backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText:         { fontWeight: '600', color: COLORS.primary },
  avatarWrap:         { marginRight: 14 },
  profileRow:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  profileInfo:        { flex: 1 },
  nameRow:            { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sellerName:         { fontSize: 18, fontWeight: '600', color: COLORS.dark },
  rolePill:           { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
  roleText:           { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  bio:                { fontSize: 13, color: COLORS.textBody, lineHeight: 20, marginTop: 4 },
  horizDivider:       { height: 0.5, backgroundColor: COLORS.card, marginBottom: 14 },
  vertDivider:        { width: 0.5, backgroundColor: COLORS.card },
  statsRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem:           { alignItems: 'center' },
  statValue:          { fontSize: 17, fontWeight: '600', color: COLORS.dark },
  statLabel:          { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actionRow:          { flexDirection: 'row', gap: 10, marginBottom: 12 },
  btnPrimary:         { flex: 1, backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  btnPrimaryFollowed: { backgroundColor: COLORS.card },
  btnPrimaryText:     { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  btnOutline:         { flex: 1, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center', backgroundColor: COLORS.white },
  btnOutlineText:     { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  btnIcon:            { backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:       { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 14 },
  ratingMain:         { flexDirection: 'row', gap: 18, alignItems: 'center', marginBottom: 14 },
  ratingScore:        { alignItems: 'center', flexShrink: 0 },
  ratingBig:          { fontSize: 42, fontWeight: '600', color: COLORS.dark, lineHeight: 48 },
  ratingCount:        { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  ratingBars:         { flex: 1, gap: 5 },
  ratingBarRow:       { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingBarStar:      { fontSize: 11, color: COLORS.muted, width: 8, textAlign: 'right' },
  ratingBarTrack:     { flex: 1, height: 6, backgroundColor: COLORS.card, borderRadius: 10, overflow: 'hidden' },
  ratingBarFill:      { height: 6, backgroundColor: COLORS.primary, borderRadius: 10 },
  ratingBarPct:       { fontSize: 11, color: COLORS.muted, width: 28 },
  catRow:             { flexDirection: 'row', justifyContent: 'space-between' },
  catItem:            { alignItems: 'center' },
  catScore:           { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  catLabel:           { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  badgeRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge:              { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText:          { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  reviewCard:         { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border },
  reviewHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  reviewLeft:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  reviewAvatarText:   { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  reviewName:         { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  reviewTime:         { fontSize: 11, color: COLORS.muted },
  reviewText:         { fontSize: 13, color: COLORS.textBody, lineHeight: 20 },
  reviewProduct:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: COLORS.bg, borderRadius: 10, padding: 8 },
  reviewProductThumb: { width: 28, height: 28, backgroundColor: COLORS.card, borderRadius: 6 },
  reviewProductName:  { fontSize: 11, color: COLORS.muted },
  viewAllBtn:         { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center', backgroundColor: COLORS.white, marginTop: 2 },
  viewAllText:        { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});