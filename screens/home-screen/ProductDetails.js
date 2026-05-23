import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
  Image, Dimensions, Alert, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './marketplacedata';
import { useAuth } from '../../context/AuthContext';
import { deleteListing, saveNewItem, removeSaved, makeOffer } from '../../services/authService';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const InfoPill = ({ label, value }) => (
  <View style={styles.infoPill}>
    <Text style={styles.infoPillLabel}>{label}</Text>
    <Text style={styles.infoPillValue}>{value ?? '—'}</Text>
  </View>
);

const StarRating = ({ rating }) => {
  const safeRating = typeof rating === 'number' ? rating : 0;
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={safeRating >= s ? 'star' : safeRating >= s - 0.5 ? 'star-half' : 'star-outline'}
          size={12}
          color="#f9a825"
        />
      ))}
      <Text style={styles.ratingText}>{safeRating}</Text>
    </View>
  );
};

// ── Offer Modal ──────────────────────────────────────────────
const OfferModal = ({ visible, onClose, itemPrice, itemTitle, itemId, getToken }) => {

  const [offerPrice, setOfferPrice] = useState('');
  const [sending, setSending] = useState(false);
  const [offerStatus, setOfferStatus] = useState(null); // null | 'pending' | 'accepted' | 'rejected'

  const suggested = [
    { label: '10% off', value: Math.round(itemPrice * 0.9) },
    { label: '20% off', value: Math.round(itemPrice * 0.8) },
    { label: '30% off', value: Math.round(itemPrice * 0.7) },
  ];

  // Replace the simulated handleSendOffer:
  const handleSendOffer = async () => {
    const parsed = parseFloat(offerPrice);
    if (!offerPrice || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid offer price.');
      return;
    }
    if (parsed >= itemPrice) {
      Alert.alert('Too High', `Your offer should be less than EGP ${itemPrice}.`);
      return;
    }
    try {
      setSending(true);
      const token = await getToken();
      await makeOffer(token, itemId, parsed);
      setOfferStatus('pending');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send offer. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOfferPrice('');
    setOfferStatus(null);
    onClose();
  };

  const STATUS_UI = {
    pending: {
      icon: '⏳',
      color: '#92400E',
      bg: '#FEF3C7',
      title: 'Offer Sent!',
      sub: 'Your offer is waiting for the seller to respond.',
    },
    accepted: {
      icon: '🎉',
      color: '#065F46',
      bg: '#D1FAE5',
      title: 'Offer Accepted!',
      sub: 'The seller accepted your offer. Proceed to checkout.',
    },
    rejected: {
      icon: '❌',
      color: '#991B1B',
      bg: '#FEE2E2',
      title: 'Offer Declined',
      sub: 'The seller declined your offer. Try a higher amount.',
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>

          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Make an Offer</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {offerStatus ? (
            // ── Status View ──
            <View style={styles.statusView}>
              <View style={[styles.statusIconBox, { backgroundColor: STATUS_UI[offerStatus].bg }]}>
                <Text style={styles.statusIcon}>{STATUS_UI[offerStatus].icon}</Text>
              </View>
              <Text style={[styles.statusTitle, { color: STATUS_UI[offerStatus].color }]}>
                {STATUS_UI[offerStatus].title}
              </Text>
              <Text style={styles.statusSub}>{STATUS_UI[offerStatus].sub}</Text>

              {offerStatus === 'pending' && (
                <View style={[styles.offerSentPill, { backgroundColor: STATUS_UI.pending.bg }]}>
                  <Text style={[styles.offerSentPillText, { color: STATUS_UI.pending.color }]}>
                    Your offer: EGP {offerPrice}
                  </Text>
                </View>
              )}

              {offerStatus === 'rejected' && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => { setOfferStatus(null); setOfferPrice(''); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeOfferBtn} onPress={handleClose} activeOpacity={0.85}>
                <Text style={styles.closeOfferBtnText}>
                  {offerStatus === 'accepted' ? 'Go to Checkout' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>

          ) : (
            // ── Input View ──
            <>
              <Text style={styles.modalItemTitle} numberOfLines={1}>{itemTitle}</Text>
              <Text style={styles.modalListingPrice}>Listed at EGP {itemPrice}</Text>

              {/* Suggested prices */}
              <Text style={styles.suggestedLabel}>Quick suggestions</Text>
              <View style={styles.suggestedRow}>
                {suggested.map((s) => (
                  <TouchableOpacity
                    key={s.label}
                    style={[
                      styles.suggestedPill,
                      offerPrice === String(s.value) && styles.suggestedPillActive,
                    ]}
                    onPress={() => setOfferPrice(String(s.value))}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.suggestedPillLabel,
                      offerPrice === String(s.value) && styles.suggestedPillLabelActive,
                    ]}>
                      {s.label}
                    </Text>
                    <Text style={[
                      styles.suggestedPillValue,
                      offerPrice === String(s.value) && styles.suggestedPillLabelActive,
                    ]}>
                      EGP {s.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Manual input */}
              <Text style={styles.orLabel}>Or enter your price</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputCurrency}>EGP</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numeric"
                  value={offerPrice}
                  onChangeText={setOfferPrice}
                />
              </View>

              {/* Note */}
              <Text style={styles.offerNote}>
                💡 Offers below 50% of the listing price are less likely to be accepted.
              </Text>

              {/* Send button */}
              <TouchableOpacity
                style={[styles.sendOfferBtn, (!offerPrice || sending) && { opacity: 0.5 }]}
                onPress={handleSendOffer}
                disabled={!offerPrice || sending}
                activeOpacity={0.85}
              >
                {sending
                  ? <ActivityIndicator size="small" color={COLORS.white} />
                  : <Text style={styles.sendOfferBtnText}>Send Offer</Text>
                }
              </TouchableOpacity>
            </>
          )}

        </View>
      </View>
    </Modal>
  );
};

// ────────────────────────────────────────────────────────────

export default function ProductDetailScreen({ navigation, route }) {
  const { item } = route.params;
  const { userId: currentUserId, getToken } = useAuth();

  const [saved, setSaved] = useState(route.params?.isSaved ?? false);
  const [activeImage, setActiveImage] = useState(0);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const imageCount = item.images?.length || 1;

  const seller = item.seller ?? {};
  const sellerName = seller.name ?? '';
  const sellerHandle = seller.handle ?? '';
  const sellerAvatar = seller.avatarUrl ?? null;
  const sellerRating = seller.rating ?? 0;
  const sellerSales = seller.totalSales ?? 0;

  const resolvedSellerId = (() => {
    if (typeof item.seller === 'string') return item.seller;
    return (
      item.seller?.userId?.toString() ??
      item.seller?._id?.toString() ??
      item.seller?.id?.toString() ??
      item.sellerId?.toString() ??
      null
    );
  })();

  const isOwnListing = !!(resolvedSellerId && currentUserId && resolvedSellerId === currentUserId);

  const getInitial = () => {
    const trimmed = sellerName.trim();
    return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
  };

  const getSavingsPercent = () => {
    const price = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
    const original = parseFloat(String(item.originalPrice).replace(/[^0-9.]/g, ''));
    if (!original || original <= 0 || isNaN(price) || isNaN(original)) return 0;
    return Math.round((1 - price / original) * 100);
  };

  const handleToggleSave = async () => {
    const prev = saved;
    setSaved(!prev);
    try {
      const token = await getToken();
      if (prev) {
        await removeSaved(token, item._id);
      } else {
        await saveNewItem(token, item._id, 'marketplace');
      }
    } catch (err) {
      setSaved(prev);
      console.error('Save failed:', err.message);
    }
  };

  const handleDeleteListing = () => {
    Alert.alert('Delete Listing', 'Are you sure you want to remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await deleteListing(token, item._id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', 'Could not delete listing.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Item Details</Text>
        {!isOwnListing && (
          <TouchableOpacity style={styles.navBtn} onPress={handleToggleSave} activeOpacity={0.8}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
              color={saved ? '#E05C5C' : COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.imageGallery}>
          <View style={styles.mainImage}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.mainImageImg} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="hanger" size={64} color={COLORS.accent} />
                <Text style={styles.imagePlaceholderText}>No photo yet</Text>
              </View>
            )}
            {imageCount > 1 && (
              <View style={styles.dotsRow}>
                {Array.from({ length: imageCount }).map((_, i) => (
                  <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
                ))}
              </View>
            )}
            {item.condition ? (
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
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle}>{item.title ?? 'Untitled'}</Text>
            <Text style={styles.itemPrice}>EGP {item.price ?? ''}</Text>
          </View>
          {item.originalPrice ? (
            <View style={styles.savingsRow}>
              <Text style={styles.originalPrice}>{item.originalPrice}</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save {getSavingsPercent()}%</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.accent} />
            <Text style={styles.locationText}>{item.location ?? ''}</Text>
            {item.postedAt ? (
              <Text style={styles.postedAt}>
                · {new Date(item.postedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{item.description ?? 'No description provided.'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seller</Text>
          <TouchableOpacity
            style={styles.sellerCard}
            activeOpacity={0.88}
            onPress={() => {
              if (!resolvedSellerId) return Alert.alert('Seller not available');
              navigation.navigate('SellerProfileScreen', { sellerId: resolvedSellerId });
            }}
          >
            <View style={styles.avatar}>
              {sellerAvatar ? (
                <Image source={{ uri: sellerAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>{getInitial()}</Text>
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{sellerName || 'Unknown Seller'}</Text>
              <Text style={styles.sellerHandle}>{sellerHandle}</Text>
              <StarRating rating={sellerRating} />
            </View>
            <View style={styles.sellerMeta}>
              <Text style={styles.sellerSalesCount}>{sellerSales}</Text>
              <Text style={styles.sellerSalesLabel}>sales</Text>
            </View>
            <Feather name="chevron-right" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.safetyTip}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.accent} />
          <Text style={styles.safetyText}>Never share personal financial info.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.ctaBar}>
        {isOwnListing ? (
          <TouchableOpacity style={styles.deleteListingBtn} onPress={handleDeleteListing} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.deleteListingBtnText}>Delete Listing</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.offerBtn} onPress={() => setOfferModalVisible(true)} activeOpacity={0.85}>
              <Text style={styles.offerBtnText}>Make an Offer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <OfferModal
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        itemPrice={parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0}
        itemTitle={item.title ?? 'Item'}
        itemId={item._id}
        getToken={getToken}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginTop: 55,
  },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700', color: '#C17C74' },
  scrollContent: { paddingBottom: 20 },
  imageGallery: { marginBottom: 4 },
  mainImage: { width: width, height: width * 1.05, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  mainImageImg: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 13, color: COLORS.muted },
  dotsRow: { position: 'absolute', bottom: 14, flexDirection: 'row', gap: 6, alignSelf: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: COLORS.white, width: 18 },
  conditionBadge: { position: 'absolute', top: 14, left: 14 },
  conditionInner: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  conditionText: { fontSize: 11, fontWeight: '700' },
  section: { paddingHorizontal: 20, paddingVertical: 18 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  itemTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1, marginRight: 12 },
  itemPrice: { fontSize: 22, fontWeight: '800', color: COLORS.accent },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  originalPrice: { fontSize: 13, color: COLORS.muted, textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: '#fce4ec', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  savingsText: { fontSize: 11, fontWeight: '700', color: '#c2185b' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  postedAt: { fontSize: 12, color: COLORS.muted },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 14 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoPill: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 72 },
  infoPillLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '600', marginBottom: 3 },
  infoPillValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },
  description: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, padding: 14, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
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
  safetyTip: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card, marginHorizontal: 20, borderRadius: 12, padding: 14, gap: 10 },
  safetyText: { flex: 1, fontSize: 12, color: COLORS.muted, lineHeight: 18 },
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16,
    paddingBottom: 28, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 12,
  },
  offerBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  offerBtnText: { color: COLORS.accent, fontSize: 15, fontWeight: '700' },

  deleteListingBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#E05C5C', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  deleteListingBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  modalItemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  modalListingPrice: { fontSize: 13, color: COLORS.muted, marginBottom: 20 },
  suggestedLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  suggestedRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  suggestedPill: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 10, alignItems: 'center' },
  suggestedPillActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  suggestedPillLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  suggestedPillValue: { fontSize: 13, color: COLORS.text, fontWeight: '700', marginTop: 2 },
  suggestedPillLabelActive: { color: COLORS.accent },
  orLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 },
  inputCurrency: { fontSize: 15, fontWeight: '700', color: COLORS.muted, marginRight: 8 },
  priceInput: { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.text },
  offerNote: { fontSize: 12, color: COLORS.muted, marginBottom: 20, lineHeight: 18 },
  sendOfferBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  sendOfferBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // ── Status View ──
  statusView: { alignItems: 'center', paddingVertical: 10 },
  statusIconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  statusIcon: { fontSize: 32 },
  statusTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  statusSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  offerSentPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
  offerSentPillText: { fontSize: 13, fontWeight: '700' },
  retryBtn: { borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 10 },
  retryBtnText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },
  closeOfferBtn: { backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 4 },
  closeOfferBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
