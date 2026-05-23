import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, Image,
  Modal, TextInput, KeyboardAvoidingView, Platform, Share, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import {
  getSellerProfile, toggleFollowSeller, getSellerReviews, createSellerReview,
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
    {[1, 2, 3, 4, 5].map(s => (
      <Ionicons key={s} name={s <= Math.round(rating) ? 'star' : 'star-outline'} size={size} color={COLORS.primary} />
    ))}
  </View>
);

const StarPicker = ({ value, onChange }) => (
  <View style={{ flexDirection: 'row', gap: 6 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <TouchableOpacity key={s} onPress={() => onChange(s)} activeOpacity={0.7}>
        <Ionicons name={s <= value ? 'star' : 'star-outline'} size={32} color={COLORS.primary} />
      </TouchableOpacity>
    ))}
  </View>
);

const Avatar = ({ uri, initials, size = 76 }) => (
  <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
    {uri
      ? <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      : <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
    }
  </View>
);

const StatItem = ({ value, label, onPress }) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
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
              {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

// ── Message modal ──────────────────────────────────────────────────
const MessageModal = ({ visible, onClose, sellerName, onSend }) => {
  const [message, setMessage] = useState('');
  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Message {sellerName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.dark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSub}>Send a message about an item or ask a question</Text>

          {/* Quick templates */}
          <Text style={styles.modalLabel}>Quick Messages</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {[
              'Is this item still available?',
              'Can you do a lower price?',
              'What are the measurements?',
              'Do you ship internationally?',
            ].map(t => (
              <TouchableOpacity
                key={t}
                style={styles.templateChip}
                onPress={() => setMessage(t)}
                activeOpacity={0.8}
              >
                <Text style={styles.templateChipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.modalLabel, { marginTop: 4 }]}>Your Message</Text>
          <TextInput
            style={styles.commentInput}
            placeholder={`Write to ${sellerName}...`}
            placeholderTextColor={COLORS.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/500</Text>

          <TouchableOpacity
            style={[styles.submitReviewBtn, !message.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!message.trim()}
            activeOpacity={0.85}
          >
            <Ionicons name="send-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.submitReviewBtnText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function SellerProfileScreen({ navigation, route }) {
  const { sellerId } = route.params ?? {};
  const { getToken } = useAuth();

  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Modals
  const [reviewModal, setReviewModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

      // ── Debug: remove after confirming shape ──────────────────
      console.log('SELLER PROFILE RAW:', JSON.stringify(profileData, null, 2));
      // ─────────────────────────────────────────────────────────

      // Handle both { seller: { user: {...}, ... } } and flat { user: {...}, ... }
      const s = profileData.seller ?? profileData;
      setSeller(s);
      if (!isFollowingRef.current) {
        setFollowed(profileData.isFollowing ?? s.isFollowing ?? false);
      }
      setReviews(reviewsData.data?.reviews ?? reviewsData.reviews ?? reviewsData ?? []);
    } catch (err) {
      console.error('fetchData error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [sellerId]);

  // ── Follow / Unfollow ──────────────────────────────────────────
  const handleToggleFollow = async () => {
    if (followLoading) return;
    const prevFollowed = followed;
    const prevCount = seller?.followersCount ?? 0;
    isFollowingRef.current = true;
    setFollowLoading(true);

    // Optimistic update
    setFollowed(!prevFollowed);
    setSeller(prev => ({
      ...prev,
      followersCount: !prevFollowed ? prevCount + 1 : Math.max(0, prevCount - 1),
    }));

    try {
      const token = await getToken();
      const data = await toggleFollowSeller(token, sellerId);

      // ── Debug ──
      console.log('FOLLOW TOGGLE RESPONSE:', JSON.stringify(data, null, 2));
      // ──────────

      // Handle both flat and nested responses
      const newIsFollowing = data.isFollowing ?? data.data?.isFollowing ?? !prevFollowed;
      const newCount = data.followersCount ?? data.data?.followersCount ?? prevCount;

      setFollowed(newIsFollowing);
      setSeller(prev => ({ ...prev, followersCount: newCount }));
    } catch (err) {
      // Rollback on error
      setFollowed(prevFollowed);
      setSeller(prev => ({ ...prev, followersCount: prevCount }));
      Alert.alert('Error', err.message);
    } finally {
      setFollowLoading(false);
      isFollowingRef.current = false;
    }
  };

  // ── Share ──────────────────────────────────────────────────────
  const handleShare = async () => {
    const user = seller?.user ?? seller ?? {};
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'this seller';
    try {
      await Share.share({
        message: `Check out ${name}'s fashion store on FASH! They have ${seller?.totalListings ?? 0} listings available.`,
        title: `${name} on FASH`,
      });
    } catch (err) {
      // User dismissed — no error needed
    }
  };

  // ── Message ────────────────────────────────────────────────────
  const handleSendMessage = async (message) => {
    setMessageModal(false);
    Alert.alert(
      'Message Sent! ✉️',
      `Your message has been sent to ${sellerName}. They usually reply within 24 hours.`,
      [{ text: 'OK' }]
    );
  };

  // ── Call seller phone (if available) ──────────────────────────
  const handleCall = () => {
    const userObj = seller?.user ?? seller ?? {};
    const phone = userObj.phone;
    if (!phone) {
      Alert.alert('No phone number', 'This seller has not provided a phone number.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // ── Submit Review ──────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    try {
      setSubmitting(true);
      const token = await getToken();
      const newReview = await createSellerReview(token, sellerId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviews(prev => [newReview.review ?? newReview, ...prev]);
      setReviewModal(false);
      setReviewRating(0);
      setReviewComment('');
      Alert.alert('Thank you!', 'Your review has been submitted.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Error guards ─────────────────────────────────────
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
          <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── KEY FIX: fall back to seller itself if user is not nested ──
  const user = seller.user ?? seller;
  const sellerName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    user.username ||
    user.name ||
    'Seller';
  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
    sellerName.slice(0, 2).toUpperCase();

  const breakdown = seller.ratingBreakdown ?? {};
  const totalReviews = seller.totalReviews ?? reviews.length;

  const categories = [
    { label: 'Quality', score: seller.qualityRating },
    { label: 'Shipping', score: seller.shippingRating },
    { label: 'Communication', score: seller.communicationRating },
    { label: 'As Described', score: seller.asDescribedRating },
  ].filter(c => c.score > 0);

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // ── Derive avatar URI from either nesting shape ────────────────
  const avatarUri = user.avatar ?? null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Seller Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Avatar uri={avatarUri} initials={initials} size={76} />
              {seller.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={10} color={COLORS.white} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.sellerName}>{sellerName}</Text>
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>Seller</Text>
              </View>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
              {seller.createdAt && (
                <Text style={styles.memberSince}>
                  Member since {new Date(seller.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </Text>
              )}
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

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, followed && styles.btnPrimaryFollowed]}
            onPress={handleToggleFollow}
            disabled={followLoading}
            activeOpacity={0.85}
          >
            {followLoading
              ? <ActivityIndicator size="small" color={followed ? COLORS.primary : COLORS.white} />
              : <>
                <Ionicons
                  name={followed ? 'checkmark' : 'add'}
                  size={15}
                  color={followed ? COLORS.primary : COLORS.white}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.btnPrimaryText, followed && { color: COLORS.primary }]}>
                  {followed ? 'Following' : 'Follow'}
                </Text>
              </>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} onPress={() => setMessageModal(true)} activeOpacity={0.85}>
            <Ionicons name="chatbubble-outline" size={15} color={COLORS.primary} style={{ marginRight: 5 }} />
            <Text style={styles.btnOutlineText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnIcon} onPress={handleShare} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={19} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick contact strip */}
        {(user.phone || user.email) && (
          <View style={styles.contactStrip}>
            {user.phone && (
              <TouchableOpacity style={styles.contactBtn} onPress={handleCall} activeOpacity={0.8}>
                <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
            )}
            {user.email && (
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => Linking.openURL(`mailto:${user.email}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={15} color={COLORS.primary} />
                <Text style={styles.contactBtnText}>Email</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
                {[5, 4, 3, 2, 1].map(star => (
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
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>
            {reviews.length > 0 ? `Reviews (${totalReviews})` : 'Reviews'}
          </Text>
          <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewModal(true)} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={14} color={COLORS.white} style={{ marginRight: 5 }} />
            <Text style={styles.writeReviewBtnText}>Write a Review</Text>
          </TouchableOpacity>
        </View>

        {reviews.length > 0 ? (
          <>
            {displayedReviews.map(r => <ReviewCard key={r._id} item={r} />)}
            {reviews.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setShowAllReviews(v => !v)}
                activeOpacity={0.85}
              >
                <Text style={styles.viewAllText}>
                  {showAllReviews ? 'Show less' : `View all ${totalReviews} reviews`}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.noReviews}>
            <Ionicons name="chatbubble-outline" size={32} color={COLORS.primary} style={{ opacity: 0.5 }} />
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSub}>Be the first to leave a review!</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Message Modal ──────────────────────────────────────── */}
      <MessageModal
        visible={messageModal}
        onClose={() => setMessageModal(false)}
        sellerName={sellerName}
        onSend={handleSendMessage}
      />

      {/* ── Review Modal ───────────────────────────────────────── */}
      <Modal visible={reviewModal} transparent animationType="slide" onRequestClose={() => setReviewModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setReviewModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Reviewing {sellerName}</Text>

            <Text style={styles.modalLabel}>Your Rating *</Text>
            <StarPicker value={reviewRating} onChange={setReviewRating} />
            {reviewRating > 0 && (
              <Text style={styles.ratingHint}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
              </Text>
            )}

            <Text style={[styles.modalLabel, { marginTop: 18 }]}>Comment (optional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this seller..."
              placeholderTextColor={COLORS.muted}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{reviewComment.length}/500</Text>

            <TouchableOpacity
              style={[styles.submitReviewBtn, (submitting || reviewRating === 0) && { opacity: 0.5 }]}
              onPress={handleSubmitReview}
              disabled={submitting || reviewRating === 0}
              activeOpacity={0.85}
            >
              {submitting
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Text style={styles.submitReviewBtnText}>Submit Review</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: COLORS.muted, fontSize: 14 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.bg },
  navTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  avatarCircle: { backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { fontWeight: '600', color: COLORS.primary },
  avatarWrap: { marginRight: 14, position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sellerName: { fontSize: 18, fontWeight: '600', color: COLORS.dark },
  rolePill: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6 },
  roleText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  bio: { fontSize: 13, color: COLORS.textBody, lineHeight: 20, marginTop: 4 },
  memberSince: { fontSize: 11, color: COLORS.muted, marginTop: 6 },
  horizDivider: { height: 0.5, backgroundColor: COLORS.card, marginBottom: 14 },
  vertDivider: { width: 0.5, backgroundColor: COLORS.card },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', paddingVertical: 4 },
  statValue: { fontSize: 17, fontWeight: '600', color: COLORS.dark },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 13 },
  btnPrimaryFollowed: { backgroundColor: COLORS.card },
  btnPrimaryText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  btnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 13, backgroundColor: COLORS.white },
  btnOutlineText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  btnIcon: { backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  contactStrip: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  contactBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 14 },
  ratingMain: { flexDirection: 'row', gap: 18, alignItems: 'center', marginBottom: 14 },
  ratingScore: { alignItems: 'center', flexShrink: 0 },
  ratingBig: { fontSize: 42, fontWeight: '600', color: COLORS.dark, lineHeight: 48 },
  ratingCount: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingBarStar: { fontSize: 11, color: COLORS.muted, width: 8, textAlign: 'right' },
  ratingBarTrack: { flex: 1, height: 6, backgroundColor: COLORS.card, borderRadius: 10, overflow: 'hidden' },
  ratingBarFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 10 },
  ratingBarPct: { fontSize: 11, color: COLORS.muted, width: 28 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catItem: { alignItems: 'center' },
  catScore: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  catLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  writeReviewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  writeReviewBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  reviewLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  reviewAvatarText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  reviewName: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  reviewTime: { fontSize: 11, color: COLORS.muted },
  reviewText: { fontSize: 13, color: COLORS.textBody, lineHeight: 20 },
  reviewProduct: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: COLORS.bg, borderRadius: 10, padding: 8 },
  reviewProductThumb: { width: 28, height: 28, backgroundColor: COLORS.card, borderRadius: 6 },
  reviewProductName: { fontSize: 11, color: COLORS.muted },
  viewAllBtn: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center', backgroundColor: COLORS.white, marginTop: 2 },
  viewAllText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  noReviews: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  noReviewsText: { fontSize: 15, fontWeight: '600', color: COLORS.dark },
  noReviewsSub: { fontSize: 13, color: COLORS.muted },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28 },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.card, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  modalSub: { fontSize: 13, color: COLORS.muted, marginBottom: 20 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: COLORS.dark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  ratingHint: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 6 },
  commentInput: { backgroundColor: COLORS.bg, borderRadius: 14, padding: 14, fontSize: 14, color: COLORS.dark, minHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  charCount: { fontSize: 11, color: COLORS.muted, textAlign: 'right', marginTop: 4, marginBottom: 4 },
  templateChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  templateChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  submitReviewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, marginTop: 12 },
  submitReviewBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});