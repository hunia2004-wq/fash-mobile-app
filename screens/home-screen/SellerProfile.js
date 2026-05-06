import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  primary: '#C17C74',
  dark: '#2C1F1F',
  muted: '#9e8e8e',
  textBody: '#5c4a4a',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.15)',
  onlineDot: '#4CAF50',
};

// ─── Mock Data ───────────────────────────────────────────────────────────────
const SELLER = {
  firstName: 'Layla',
  lastName: 'Hassan',
  initials: 'LH',
  role: 'Fashion Seller',
  location: 'Cairo, Egypt',
  bio: 'Curating timeless & aesthetic fashion pieces. Vintage lover, sustainability advocate. Ships worldwide 🌍',
  isVerified: true,
  isOnline: true,
  stats: {
    listings: 284,
    sales: '1.2k',
    followers: 843,
    response: '98%',
  },
  rating: 4.8,
  totalReviews: 342,
  breakdown: [
    { star: 5, pct: 78 },
    { star: 4, pct: 15 },
    { star: 3, pct: 5 },
    { star: 2, pct: 2 },
    { star: 1, pct: 0 },
  ],
  categories: [
    { label: 'Quality', score: 4.9 },
    { label: 'Shipping', score: 4.7 },
    { label: 'Communication', score: 5.0 },
    { label: 'As Described', score: 4.8 },
  ],
  badges: [
    { label: 'Top Seller', icon: 'star' },
    { label: 'Trusted', icon: 'shield-checkmark' },
    { label: 'Fast Shipper', icon: 'time' },
    { label: 'Eco Friendly', icon: 'leaf' },
  ],
};

const REVIEWS = [
  {
    id: '1',
    initials: 'SA',
    name: 'Sara A.',
    time: '2 days ago',
    rating: 5,
    text: 'Absolutely love the dress I got! Quality is stunning and it arrived so well packaged. Layla was super responsive too. Highly recommend!',
    product: 'Vintage Floral Midi Dress',
  },
  {
    id: '2',
    initials: 'NM',
    name: 'Nour M.',
    time: '1 week ago',
    rating: 4,
    text: 'Great seller! Item was exactly as described. Shipping was quick and the packaging was really cute and eco-friendly.',
    product: null,
  },
  {
    id: '3',
    initials: 'RA',
    name: 'Reem Al.',
    time: '2 weeks ago',
    rating: 5,
    text: 'Second time buying from Layla and she never disappoints. The blazer fits perfectly. Will definitely be back!',
    product: null,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const StarRow = ({ rating, size = 13 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {stars.map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={COLORS.primary}
        />
      ))}
    </View>
  );
};

const Avatar = ({ initials, size = 76 }) => (
  <View
    style={[
      styles.avatarCircle,
      { width: size, height: size, borderRadius: size / 2 },
    ]}
  >
    <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{initials}</Text>
  </View>
);

const StatItem = ({ value, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Divider = ({ vertical }) =>
  vertical ? (
    <View style={styles.vertDivider} />
  ) : (
    <View style={styles.horizDivider} />
  );

const RatingBar = ({ star, pct }) => (
  <View style={styles.ratingBarRow}>
    <Text style={styles.ratingBarStar}>{star}</Text>
    <View style={styles.ratingBarTrack}>
      <View style={[styles.ratingBarFill, { width: `${pct}%` }]} />
    </View>
    <Text style={styles.ratingBarPct}>{pct}%</Text>
  </View>
);

const Badge = ({ label, icon }) => (
  <View style={styles.badge}>
    <Ionicons name={icon} size={13} color={COLORS.primary} />
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

const ReviewCard = ({ item }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewLeft}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>{item.initials}</Text>
        </View>
        <View>
          <Text style={styles.reviewName}>{item.name}</Text>
          <Text style={styles.reviewTime}>{item.time}</Text>
        </View>
      </View>
      <StarRow rating={item.rating} size={11} />
    </View>
    <Text style={styles.reviewText}>{item.text}</Text>
    {item.product && (
      <View style={styles.reviewProduct}>
        <View style={styles.reviewProductThumb} />
        <Text style={styles.reviewProductName}>{item.product}</Text>
      </View>
    )}
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SellerProfile({ navigation }) {
  const [followed, setFollowed] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.goBack()}
        >
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
        {/* ── Profile Header Card ── */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Avatar initials={SELLER.initials} size={76} />
              {SELLER.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.sellerName}>
                  {SELLER.firstName} {SELLER.lastName}
                </Text>
                {SELLER.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.primary}
                  />
                )}
              </View>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{SELLER.role}</Text>
              </View>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={COLORS.muted}
                />
                <Text style={styles.locationText}>{SELLER.location}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.bio}>{SELLER.bio}</Text>

          {/* Stats */}
          <Divider />
          <View style={styles.statsRow}>
            <StatItem value={SELLER.stats.listings} label="Listings" />
            <Divider vertical />
            <StatItem value={SELLER.stats.sales} label="Sales" />
            <Divider vertical />
            <StatItem value={SELLER.stats.followers} label="Followers" />
            <Divider vertical />
            <StatItem value={SELLER.stats.response} label="Response" />
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.btnPrimary,
              followed && styles.btnPrimaryFollowed,
            ]}
            onPress={() => setFollowed(!followed)}
          >
            <Text style={styles.btnPrimaryText}>
              {followed ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline}>
            <Text style={styles.btnOutlineText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnIcon}>
            <Ionicons name="share-outline" size={19} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Ratings Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <View style={styles.ratingMain}>
            {/* Score */}
            <View style={styles.ratingScore}>
              <Text style={styles.ratingBig}>{SELLER.rating}</Text>
              <StarRow rating={SELLER.rating} size={13} />
              <Text style={styles.ratingCount}>
                {SELLER.totalReviews} reviews
              </Text>
            </View>
            {/* Bars */}
            <View style={styles.ratingBars}>
              {SELLER.breakdown.map((b) => (
                <RatingBar key={b.star} star={b.star} pct={b.pct} />
              ))}
            </View>
          </View>

          {/* Sub-category scores */}
          <Divider />
          <View style={styles.catRow}>
            {SELLER.categories.map((c) => (
              <View key={c.label} style={styles.catItem}>
                <Text style={styles.catScore}>{c.score.toFixed(1)}</Text>
                <Text style={styles.catLabel}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Badges Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgeRow}>
            {SELLER.badges.map((b) => (
              <Badge key={b.label} label={b.label} icon={b.icon} />
            ))}
          </View>
        </View>

        {/* ── Reviews ── */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 4, marginBottom: 10 }]}>
          Recent reviews
        </Text>
        {REVIEWS.map((r) => (
          <ReviewCard key={r.id} item={r} />
        ))}
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>
            View all {SELLER.totalReviews} reviews
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  iconBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 12,
    backgroundColor: COLORS.card, 
    alignItems: 'center', 
    justifyContent: 'center',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },

  // Avatar
  avatarCircle: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.onlineDot,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  bio: {
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 20,
    marginBottom: 14,
  },

  // Dividers
  horizDivider: {
    height: 0.5,
    backgroundColor: COLORS.card,
    marginBottom: 14,
  },
  vertDivider: {
    width: 0.5,
    backgroundColor: COLORS.card,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnPrimaryFollowed: {
    backgroundColor: COLORS.card,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnIcon: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section title
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 14,
  },

  // Rating
  ratingMain: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingScore: {
    alignItems: 'center',
    flexShrink: 0,
  },
  ratingBig: {
    fontSize: 42,
    fontWeight: '600',
    color: COLORS.dark,
    lineHeight: 48,
  },
  ratingCount: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ratingBarStar: {
    fontSize: 11,
    color: COLORS.muted,
    width: 8,
    textAlign: 'right',
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  ratingBarPct: {
    fontSize: 11,
    color: COLORS.muted,
    width: 28,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catItem: { alignItems: 'center' },
  catScore: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  catLabel: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: 'center',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Review cards
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.dark,
  },
  reviewTime: {
    fontSize: 11,
    color: COLORS.muted,
  },
  reviewText: {
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 20,
  },
  reviewProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    padding: 8,
  },
  reviewProductThumb: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.card,
    borderRadius: 6,
  },
  reviewProductName: {
    fontSize: 11,
    color: COLORS.muted,
  },

  // View all button
  viewAllBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 2,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});