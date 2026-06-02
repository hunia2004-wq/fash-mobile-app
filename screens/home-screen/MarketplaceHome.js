import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES } from './marketplacedata';
import { getAllListings, getSaved, saveNewItem, removeSaved, deleteListing } from '../../services/authService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { wp, hp, fp, SCREEN } from '../../utils/responsive';

const CARD_WIDTH = (SCREEN.width - wp(48)) / 2;

const ConditionBadge = ({ condition }) => (
  <View style={[styles.conditionBadge, { backgroundColor: condition === 'Like New' ? '#e8f5e9' : '#fff8e1' }]}>
    <Text style={[styles.conditionText, { color: condition === 'Like New' ? '#388e3c' : '#f9a825' }]}>{condition}</Text>
  </View>
);

export default function MarketplaceScreen({ navigation, route }) {
  const { getToken, userId: currentUserId } = useAuth();
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [savedItems, setSavedItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const wishlistCount = Object.keys(wishlistItems).length;
  const wishlistList = listings.filter((item) => wishlistItems[item._id]);
  const { addToCart, removeFromCart, cartItems: cartList, isInCart, cartCount: contextCartCount } = useCart();
  const cartTotal = cartList.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  const toggleHeart = async (id, e) => {
    e && e.stopPropagation();
    const alreadySaved = savedItems[id];
    setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));
    setWishlistItems(prev => { const u = { ...prev }; if (u[id]) { delete u[id]; } else { u[id] = true; } return u; });
    try {
      const token = await getToken();
      if (alreadySaved) { await removeSaved(token, id); } else { await saveNewItem(token, id, 'marketplace'); }
    } catch (err) {
      setSavedItems(prev => ({ ...prev, [id]: alreadySaved }));
      setWishlistItems(prev => { const u = { ...prev }; if (alreadySaved) { u[id] = true; } else { delete u[id]; } return u; });
    }
  };

  const handleDeleteListing = async (id) => {
    Alert.alert('Delete Listing', 'Are you sure you want to remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = await getToken();
          await deleteListing(token, id);
          setListings(prev => prev.filter(item => item._id !== id));
        } catch (err) { Alert.alert('Error', 'Could not delete listing.'); }
      }},
    ]);
  };

  useEffect(() => {
    if (route.params?.initialSearch) { setSearchQuery(route.params.initialSearch); setShowSearch(true); }
  }, []);

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => { const u = { ...prev }; delete u[id]; return u; });
    setSavedItems((prev) => ({ ...prev, [id]: false }));
  };

  const moveToCart = (id) => {
    const item = listings.find((i) => i._id === id);
    if (item) addToCart(item);
    removeFromWishlist(id);
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(listings.length === 0);
      setError(null);
      const data = await getAllListings({ category: activeCategory === 'All' ? undefined : activeCategory, search: searchQuery });
      setListings(Array.isArray(data) ? data : data.listings || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || t('load_failed'));
    } finally { setLoading(false); }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const delay = setTimeout(() => fetchListings(), searchQuery ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchListings]);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getSaved(token);
        const items = data.savedItems ?? data ?? [];
        const savedMap = {}, wishlistMap = {};
        items.filter(s => s.itemType === 'marketplace').forEach(s => { savedMap[s.itemId] = true; wishlistMap[s.itemId] = true; });
        setSavedItems(savedMap); setWishlistItems(wishlistMap);
      } catch (err) { console.error('Failed to load saved state:', err.message); }
    };
    loadSavedState();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { fetchListings(); });
    return unsubscribe;
  }, [navigation, fetchListings]);

  useEffect(() => {
    const interval = setInterval(() => { fetchListings(); }, 15000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={wp(16)} color={COLORS.muted} style={{ marginRight: wp(8) }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search_listings')}
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <Ionicons name="close" size={wp(18)} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={wp(18)} color={COLORS.text} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle} numberOfLines={1}>{t('marketplace')}</Text>
                <Text style={styles.headerSub} numberOfLines={1}>
                  {loading ? t('loading') : `${listings.length} ${t('listings_near_you')}`}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)} activeOpacity={0.8}>
                <Ionicons name="search-outline" size={wp(18)} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowWishlist(true)} activeOpacity={0.8}>
                <Ionicons name="heart-outline" size={wp(18)} color={COLORS.accent} />
                {wishlistCount > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowCart(true)} activeOpacity={0.8}>
                <Ionicons name="cart-outline" size={wp(18)} color={COLORS.accent} />
                {contextCartCount > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{contextCartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddListingScreen')} activeOpacity={0.85}>
                <Feather name="plus" size={wp(18)} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: hp(60) }} />
        ) : error ? (
          <View style={styles.centerMsg}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchListings}>
              <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : listings.length === 0 ? (
          <Text style={styles.emptyText}>{t('no_items_found')}</Text>
        ) : (
          <View style={styles.grid}>
            {listings.map((item) => {
              const resolvedSellerId =
                item.seller?.userId?.toString() ??
                item.seller?._id?.toString() ??
                item.sellerId?.toString() ?? null;
              const isOwner = !!(currentUserId && resolvedSellerId && resolvedSellerId === currentUserId);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={styles.itemCard}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('ProductDetails', { item })}
                >
                  <View style={styles.itemImageBox}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                      <MaterialCommunityIcons name="hanger" size={wp(40)} color={COLORS.accent} />
                    )}
                    <View style={styles.badgeWrap}><ConditionBadge condition={item.condition} /></View>
                    {isOwner ? (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={(e) => { e.stopPropagation(); handleDeleteListing(item._id); }}
                        activeOpacity={0.8}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={wp(15)} color="#E05C5C" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={(e) => toggleHeart(item._id, e)}
                        activeOpacity={0.8}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={savedItems[item._id] ? 'heart' : 'heart-outline'}
                          size={wp(16)}
                          color={savedItems[item._id] ? '#E05C5C' : '#C17C74'}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemBrand}>{item.brand || t('no_brand')} · {item.size || 'N/A'}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>

                    {/* ── Price block ──────────────────────────────────────────
                        Left:  "Secondhand" label + selling price (what buyer pays)
                        Right: "Retail" label + original new price (for reference only)
                    ────────────────────────────────────────────────────────── */}
                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.priceLabel}>Secondhand</Text>
                        <Text style={styles.itemPrice}>EGP {item.price}</Text>
                      </View>
                      {item.originalPrice && (
                        <View style={styles.retailPill}>
                          <Text style={styles.retailPillLabel}>Retail</Text>
                          <Text style={styles.itemOriginalPrice}>EGP {item.originalPrice}</Text>
                        </View>
                      )}
                    </View>

                    {!isOwner && (
                      <TouchableOpacity
                        style={[styles.cartBtn, isInCart(item._id) && styles.cartBtnActive]}
                        onPress={() => addToCart(item, 'marketplace')}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name={isInCart(item._id) ? 'cart' : 'cart-outline'}
                          size={wp(13)}
                          color={isInCart(item._id) ? COLORS.white : COLORS.accent}
                          style={{ marginRight: wp(5) }}
                        />
                        <Text style={[styles.cartBtnText, isInCart(item._id) && styles.cartBtnTextActive]}>
                          {isInCart(item._id) ? t('in_cart') : t('add_to_cart')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* CART MODAL */}
      <Modal visible={showCart} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('my_cart')}</Text>
            <TouchableOpacity onPress={() => setShowCart(false)} style={styles.modalClose}>
              <Ionicons name="close" size={wp(20)} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {cartList.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="cart-outline" size={wp(52)} color={COLORS.accent} />
              <Text style={styles.modalEmptyTitle}>{t('cart_empty')}</Text>
              <Text style={styles.modalEmptySub}>{t('cart_empty_sub')}</Text>
            </View>
          ) : (
            <>
              <ScrollView contentContainerStyle={styles.modalList}>
                {cartList.map((item) => (
                  <View key={item._id} style={styles.modalItem}>
                    <View style={styles.modalItemImage}>
                      {item.image
                        ? <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        : <MaterialCommunityIcons name="hanger" size={wp(28)} color={COLORS.accent} />}
                    </View>
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.modalItemBrand}>{item.brand || t('no_brand')} · {item.condition || 'N/A'}</Text>
                      <Text style={styles.modalItemPrice}>EGP {item.price}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item._id)} style={styles.modalRemoveBtn}>
                      <Ionicons name="trash-outline" size={wp(18)} color="#E05C5C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.modalFooter}>
                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>{t('total')}</Text>
                  <Text style={styles.modalTotalValue}>EGP {cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => { setShowCart(false); navigation.navigate('MainCart'); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="card-outline" size={wp(16)} color={COLORS.white} style={{ marginRight: wp(8) }} />
                  <Text style={styles.checkoutBtnText}>{t('checkout')} · EGP {cartTotal.toFixed(2)}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* WISHLIST MODAL */}
      <Modal visible={showWishlist} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('my_wishlist')}</Text>
            <TouchableOpacity onPress={() => setShowWishlist(false)} style={styles.modalClose}>
              <Ionicons name="close" size={wp(20)} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {wishlistList.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="heart-outline" size={wp(52)} color={COLORS.accent} />
              <Text style={styles.modalEmptyTitle}>{t('wishlist_empty')}</Text>
              <Text style={styles.modalEmptySub}>{t('wishlist_empty_sub')}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalList}>
              {wishlistList.map((item) => (
                <View key={item._id} style={styles.modalItem}>
                  <View style={styles.modalItemImage}>
                    {item.image
                      ? <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      : <MaterialCommunityIcons name="hanger" size={wp(28)} color={COLORS.accent} />}
                  </View>
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.modalItemBrand}>{item.brand || t('no_brand')} · {item.size || 'N/A'}</Text>
                    <Text style={styles.modalItemPrice}>EGP {item.price}</Text>
                  </View>
                  <View style={styles.wishlistActions}>
                    <TouchableOpacity style={styles.moveToCartBtn} onPress={() => moveToCart(item._id)} activeOpacity={0.85}>
                      <Ionicons name="cart-outline" size={wp(14)} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromWishlist(item._id)} style={styles.modalRemoveBtn}>
                      <Ionicons name="trash-outline" size={wp(18)} color="#E05C5C" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center' },
  logo: { width: wp(120), height: hp(50) },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
    marginBottom: hp(14),
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    marginRight: wp(8),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    flexShrink: 0,
  },
  headerTitle: { fontSize: fp(17), fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: fp(12), color: COLORS.muted },

  navBtn: { width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  addBtn:  { width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },

  badgeCount: { position: 'absolute', top: hp(3), right: wp(3), width: wp(15), height: wp(15), borderRadius: wp(8), backgroundColor: '#E05C5C', alignItems: 'center', justifyContent: 'center' },
  badgeCountText: { fontSize: fp(8), fontWeight: '800', color: COLORS.white },

  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: wp(12), paddingHorizontal: wp(12), height: hp(40) },
  searchInput: { flex: 1, fontSize: fp(14), color: COLORS.text },

  categoryWrapper: { height: hp(50), marginBottom: hp(12) },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(16), paddingBottom: hp(6) },
  categoryPill: { paddingHorizontal: wp(14), paddingVertical: hp(7), borderRadius: wp(20), backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: wp(8), flexShrink: 0 },
  categoryPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText: { fontSize: fp(12), fontWeight: '600', color: COLORS.muted },
  categoryTextActive: { color: COLORS.white },

  scrollContent: { paddingBottom: hp(40) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(12), gap: wp(12) },
  itemCard: { width: CARD_WIDTH, backgroundColor: COLORS.white, borderRadius: wp(16), overflow: 'hidden', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  itemImageBox: { height: hp(170), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%' },
  badgeWrap: { position: 'absolute', top: hp(10), left: wp(10) },
  conditionBadge: { paddingHorizontal: wp(8), paddingVertical: hp(3), borderRadius: wp(8) },
  conditionText: { fontSize: fp(10), fontWeight: '700' },
  heartBtn: { position: 'absolute', top: hp(10), right: wp(10), width: wp(30), height: wp(30), borderRadius: wp(15), backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  deleteBtn: { position: 'absolute', top: hp(10), right: wp(10), width: wp(30), height: wp(30), borderRadius: wp(15), backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { padding: wp(10) },
  itemTitle: { fontSize: fp(13), fontWeight: '700', color: COLORS.text },
  itemBrand: { fontSize: fp(11), color: COLORS.accent, fontWeight: '600', marginTop: hp(2) },
  itemDescription: { fontSize: fp(11), color: COLORS.muted, marginTop: hp(3) },

  // ── Price block ──
  // Left column: "Secondhand" micro-label + bold selling price
  // Right column: "Retail" micro-label + muted original price (no strikethrough)
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: hp(6) },
  priceLabel: { fontSize: fp(9), fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: hp(1) },
  itemPrice: { fontSize: fp(14), fontWeight: '700', color: COLORS.accent },
  retailPill: { alignItems: 'flex-end' },
  retailPillLabel: { fontSize: fp(9), fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: hp(1) },
  itemOriginalPrice: { fontSize: fp(11), color: COLORS.muted },   // no strikethrough — retail is reference, not a sale

  cartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: hp(8), borderRadius: wp(10), paddingVertical: hp(7), borderWidth: 1.5, borderColor: COLORS.accent, backgroundColor: COLORS.white },
  cartBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  cartBtnText: { fontSize: fp(11), fontWeight: '700', color: COLORS.accent },
  cartBtnTextActive: { color: COLORS.white },

  centerMsg: { alignItems: 'center', marginTop: hp(60) },
  errorText: { color: 'red', marginBottom: hp(12) },
  retryBtn: { backgroundColor: COLORS.accent, paddingHorizontal: wp(20), paddingVertical: hp(10), borderRadius: wp(10) },
  retryText: { color: COLORS.white, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: hp(40), color: COLORS.muted },

  modalSafe: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(20), paddingVertical: hp(16), backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: fp(18), fontWeight: '800', color: COLORS.accent },
  modalClose: { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  modalEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: hp(12) },
  modalEmptyTitle: { fontSize: fp(18), fontWeight: '700', color: COLORS.text },
  modalEmptySub: { fontSize: fp(13), color: COLORS.muted },
  modalList: { paddingHorizontal: wp(16), paddingTop: hp(16), paddingBottom: hp(120) },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: wp(12), backgroundColor: COLORS.white, borderRadius: wp(16), padding: wp(12), marginBottom: hp(10), borderWidth: 1, borderColor: COLORS.border },
  modalItemImage: { width: wp(60), height: wp(60), borderRadius: wp(12), backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  modalItemInfo: { flex: 1 },
  modalItemTitle: { fontSize: fp(13), fontWeight: '700', color: COLORS.text },
  modalItemBrand: { fontSize: fp(11), color: COLORS.muted, marginTop: hp(2) },
  modalItemPrice: { fontSize: fp(14), fontWeight: '800', color: COLORS.accent, marginTop: hp(4) },
  modalRemoveBtn: { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: '#fdecea', alignItems: 'center', justifyContent: 'center' },
  wishlistActions: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
  moveToCartBtn: { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: wp(20), paddingVertical: hp(16), paddingBottom: hp(32), gap: hp(12) },
  modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTotalLabel: { fontSize: fp(14), fontWeight: '600', color: COLORS.muted },
  modalTotalValue: { fontSize: fp(22), fontWeight: '900', color: COLORS.accent },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: wp(16), paddingVertical: hp(16) },
  checkoutBtnText: { fontSize: fp(15), fontWeight: '700', color: COLORS.white },
});