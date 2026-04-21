import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './marketplaceData';

const { width } = Dimensions.get('window');

const InfoPill = ({ label, value }) => (
  <View style={styles.infoPill}>
    <Text style={styles.infoPillLabel}>{label}</Text>
    <Text style={styles.infoPillValue}>{value}</Text>
  </View>
);

const StarRating = ({ rating }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Ionicons
        key={s}
        name={rating >= s ? 'star' : rating >= s - 0.5 ? 'star-half' : 'star-outline'}
        size={12}
        color="#f9a825"
      />
    ))}
    <Text style={styles.ratingText}>{rating}</Text>
  </View>
);

export default function ProductDetailScreen({ navigation, route }) {
  const { item } = route.params;
  const [saved, setSaved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const imageCount = item.images?.length || 1;

  const handleMessage = () => {
    Alert.alert('Message Seller', `Start a conversation with ${item.seller}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Message', onPress: () => {} },
    ]);
  };

  const handleOffer = () => {
    Alert.alert('Make an Offer', 'This feature is coming soon!');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Sticky top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Item Details</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setSaved((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? '#E05C5C' : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Image gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.mainImage}>
            {item.image ? (
              <Image source={item.image} style={styles.mainImageImg} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="hanger" size={64} color={COLORS.accent} />
                <Text style={styles.imagePlaceholderText}>No photo yet</Text>
              </View>
            )}

            {/* Image dots */}
            {imageCount > 1 && (
              <View style={styles.dotsRow}>
                {Array.from({ length: imageCount }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeImage && styles.dotActive]}
                  />
                ))}
              </View>
            )}

            {/* Condition badge */}
            <View style={styles.conditionBadge}>
              <View style={[
                styles.conditionInner,
                { backgroundColor: item.condition === 'Like New' ? '#e8f5e9' : '#fff8e1' }
              ]}>
                <Text style={[
                  styles.conditionText,
                  { color: item.condition === 'Like New' ? '#388e3c' : '#f9a825' }
                ]}>
                  ✦ {item.condition}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
          </View>

          {item.originalPrice && (
            <View style={styles.savingsRow}>
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>
                  Save {Math.round((1 - parseInt(item.price.replace('$','')) / parseInt(item.originalPrice.replace('$',''))) * 100)}%
                </Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.accent} />
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.postedAt}>· {item.postedAt}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info pills */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Details</Text>
          <View style={styles.pillsRow}>
            <InfoPill label="Brand" value={item.brand} />
            <InfoPill label="Size" value={item.size} />
            <InfoPill label="Category" value={item.category} />
            <InfoPill label="Condition" value={item.condition} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Seller card */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seller</Text>
          <TouchableOpacity
            style={styles.sellerCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('SellerProfile', { seller: item })}
          >
            {/* Avatar */}
            <View style={styles.avatar}>
              {item.sellerAvatar ? (
                <Image source={item.sellerAvatar} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {item.seller.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.seller}</Text>
              <Text style={styles.sellerHandle}>{item.sellerHandle}</Text>
              <StarRating rating={item.sellerRating} />
            </View>

            <View style={styles.sellerMeta}>
              <Text style={styles.sellerSalesCount}>{item.sellerSales}</Text>
              <Text style={styles.sellerSalesLabel}>sales</Text>
            </View>

            <Feather name="chevron-right" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Safety tip */}
        <View style={styles.safetyTip}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.accent} />
          <Text style={styles.safetyText}>
            Meet in a safe, public place. Never share personal financial info.
          </Text>
        </View>

        {/* Bottom padding for sticky CTA */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity style={styles.offerBtn} onPress={handleOffer} activeOpacity={0.85}>
          <Text style={styles.offerBtnText}>Make Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageBtn} onPress={handleMessage} activeOpacity={0.85}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.messageBtnText}>Message Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  scrollContent: { paddingBottom: 20 },

  imageGallery: { marginBottom: 4 },
  mainImage: {
    width: width,
    height: width * 1.05,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageImg: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 13, color: COLORS.muted },

  dotsRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: COLORS.white, width: 18 },

  conditionBadge: { position: 'absolute', top: 14, left: 14 },
  conditionInner: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  conditionText: { fontSize: 11, fontWeight: '700' },

  section: { paddingHorizontal: 20, paddingVertical: 18 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  itemPrice: { fontSize: 22, fontWeight: '800', color: COLORS.accent },

  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  originalPrice: {
    fontSize: 13,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: '#fce4ec',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingsText: { fontSize: 11, fontWeight: '700', color: '#c2185b' },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  postedAt: { fontSize: 12, color: COLORS.muted },

  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 14,
  },

  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoPill: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 72,
  },
  infoPillLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '600', marginBottom: 3 },
  infoPillValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },

  description: { fontSize: 14, color: COLORS.text, lineHeight: 22 },

  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarInitial: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  sellerHandle: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, color: COLORS.muted, marginLeft: 4, fontWeight: '600' },
  sellerMeta: { alignItems: 'center' },
  sellerSalesCount: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  sellerSalesLabel: { fontSize: 10, color: COLORS.muted },

  safetyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  safetyText: { flex: 1, fontSize: 12, color: COLORS.muted, lineHeight: 18 },

  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  offerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },
  messageBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
