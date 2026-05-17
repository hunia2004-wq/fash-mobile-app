import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, TextInput, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES } from './marketplacedata';
import { getAllListings } from '../../services/authService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getSaved, saveNewItem, removeSaved } from '../../services/authService';


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ConditionBadge = ({ condition }) => (
  <View style={[
    styles.conditionBadge,
    { backgroundColor: condition === 'Like New' ? '#e8f5e9' : '#fff8e1' },
  ]}>
    <Text style={[
      styles.conditionText,
      { color: condition === 'Like New' ? '#388e3c' : '#f9a825' },
    ]}>
      {condition}
    </Text>
  </View>
);

export default function MarketplaceScreen({ navigation, route }) {

  const { getToken } = useAuth();

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
    setWishlistItems(prev => {
    const updated = { ...prev };
    if (updated[id]) { delete updated[id]; } else { updated[id] = true; }
    return updated;
  });

  try {
    const token = await getToken();
    if (alreadySaved) {
      await removeSaved(token, id);
    } else {
      await saveNewItem(token, id, 'marketplace');
    }
  } catch (err) {
    setSavedItems(prev => ({ ...prev, [id]: alreadySaved }));
    setWishlistItems(prev => {
      const updated = { ...prev };
      if (alreadySaved) { updated[id] = true; } else { delete updated[id]; }
      return updated;
    });
    console.error('Save failed:', err.message);
  }
};

useEffect(() => {
  if (route.params?.initialSearch) {
    setSearchQuery(route.params.initialSearch);
    setShowSearch(true);
  }
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
      const data = await getAllListings({
        category: activeCategory === 'All' ? undefined : activeCategory,
        search: searchQuery,
      });
      setListings(Array.isArray(data) ? data : data.listings || []);
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
        err.message ||
        'Failed to load listings'
      );
    } finally {
      setLoading(false);
    }
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
        const savedMap = {};
        const wishlistMap = {};
        items
          .filter(s => s.itemType === 'marketplace')
          .forEach(s => {
            savedMap[s.itemId] = true;
            wishlistMap[s.itemId] = true;
          });
        setSavedItems(savedMap);
        setWishlistItems(wishlistMap);
      } catch (err) {
        console.error('Failed to load saved state:', err.message);
      }
    };
    loadSavedState();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('../../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search listings..."
              placeholderTextColor={COLORS.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <Ionicons name="close" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Marketplace</Text>
                <Text style={styles.headerSub}>
                  {loading ? 'Loading...' : `${listings.length} listings near you`}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)} activeOpacity={0.8}>
                <Ionicons name="search-outline" size={20} color={COLORS.accent} />
              </TouchableOpacity>

              {/* Wishlist */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowWishlist(true)} activeOpacity={0.8}>
                <Ionicons name="heart-outline" size={20} color={COLORS.accent} />
                {wishlistCount > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Cart — uses context count */}
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowCart(true)} activeOpacity={0.8}>
                <Ionicons name="cart-outline" size={20} color={COLORS.accent} />
                {contextCartCount > 0 && (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{contextCartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddListingScreen')} activeOpacity={0.85}>
                <Feather name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 60 }} />
        ) : error ? (
          <View style={styles.centerMsg}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchListings}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : listings.length === 0 ? (
          <Text style={styles.emptyText}>No items found</Text>
        ) : (
          <View style={styles.grid}>
            {listings.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.itemCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('ProductDetails', { item })}
              >
                <View style={styles.itemImageBox}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                      onError={() => console.log('Image failed')}
                    />
                  ) : (
                    <MaterialCommunityIcons name="hanger" size={40} color={COLORS.accent} />
                  )}

                  <View style={styles.badgeWrap}>
                    <ConditionBadge condition={item.condition} />
                  </View>

                  {/* Heart */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => toggleHeart(item._id, e)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={savedItems[item._id] ? 'heart' : 'heart-outline'}
                      size={16}
                      color={savedItems[item._id] ? '#E05C5C' : COLORS.muted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemBrand}>{item.brand || 'No brand'} · {item.size || 'N/A'}</Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>EGP {item.price}</Text>
                    {item.originalPrice && (
                      <Text style={styles.itemOriginalPrice}>EGP {item.originalPrice}</Text>
                    )}
                  </View>

                  {/* Cart button — uses context */}
                  <TouchableOpacity
                    style={[styles.cartBtn, isInCart(item._id) && styles.cartBtnActive]}
                    onPress={() => addToCart(item, 'marketplace')}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={isInCart(item._id) ? 'cart' : 'cart-outline'}
                      size={13}
                      color={isInCart(item._id) ? COLORS.white : COLORS.accent}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.cartBtnText, isInCart(item._id) && styles.cartBtnTextActive]}>
                      {isInCart(item._id) ? 'In Cart' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CART MODAL */}
      <Modal visible={showCart} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Cart</Text>
            <TouchableOpacity onPress={() => setShowCart(false)} style={styles.modalClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {cartList.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="cart-outline" size={52} color={COLORS.accent} />
              <Text style={styles.modalEmptyTitle}>Your cart is empty</Text>
              <Text style={styles.modalEmptySub}>Add items from the marketplace</Text>
            </View>
          ) : (
            <>
              <ScrollView contentContainerStyle={styles.modalList}>
                {cartList.map((item) => (
                  <View key={item._id} style={styles.modalItem}>
                    <View style={styles.modalItemImage}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <MaterialCommunityIcons name="hanger" size={28} color={COLORS.accent} />
                      )}
                    </View>
                    <View style={styles.modalItemInfo}>
                      <Text style={styles.modalItemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.modalItemBrand}>{item.brand || 'No brand'} · {item.size || 'N/A'}</Text>
                      <Text style={styles.modalItemPrice}>EGP {item.price}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item._id)} style={styles.modalRemoveBtn}>
                      <Ionicons name="trash-outline" size={18} color="#E05C5C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.modalFooter}>
                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>Total</Text>
                  <Text style={styles.modalTotalValue}>EGP {cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={() => { setShowCart(false); navigation.navigate('MainCart'); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="card-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.checkoutBtnText}>Checkout · EGP {cartTotal.toFixed(2)}</Text>
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
            <Text style={styles.modalTitle}>My Wishlist</Text>
            <TouchableOpacity onPress={() => setShowWishlist(false)} style={styles.modalClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {wishlistList.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="heart-outline" size={52} color={COLORS.accent} />
              <Text style={styles.modalEmptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.modalEmptySub}>Tap the heart on any item to save it</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalList}>
              {wishlistList.map((item) => (
                <View key={item._id} style={styles.modalItem}>
                  <View style={styles.modalItemImage}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <MaterialCommunityIcons name="hanger" size={28} color={COLORS.accent} />
                    )}
                  </View>
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.modalItemBrand}>{item.brand || 'No brand'} · {item.size || 'N/A'}</Text>
                    <Text style={styles.modalItemPrice}>EGP {item.price}</Text>
                  </View>
                  <View style={styles.wishlistActions}>
                    <TouchableOpacity style={styles.moveToCartBtn} onPress={() => moveToCart(item._id)} activeOpacity={0.85}>
                      <Ionicons name="cart-outline" size={14} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromWishlist(item._id)} style={styles.modalRemoveBtn}>
                      <Ionicons name="trash-outline" size={18} color="#E05C5C" />
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
  logoHeader: { paddingBottom: 10, alignItems: 'center' },
  logo: { width: 120, height: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  badgeCount: { position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#E05C5C', alignItems: 'center', justifyContent: 'center' },
  badgeCountText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  categoryScroll: { flexGrow: 0, maxHeight: 50 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  categoryPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  categoryTextActive: { color: COLORS.white },
  scrollContent: { paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  itemCard: { width: CARD_WIDTH, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  itemImageBox: { height: 170, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%' },
  badgeWrap: { position: 'absolute', top: 10, left: 10 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  conditionText: { fontSize: 10, fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  itemInfo: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  itemBrand: { fontSize: 11, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
  itemDescription: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  priceRow: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  itemOriginalPrice: { fontSize: 11, textDecorationLine: 'line-through', color: COLORS.muted },
  cartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 10, paddingVertical: 7, borderWidth: 1.5, borderColor: COLORS.accent, backgroundColor: COLORS.white },
  cartBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  cartBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.accent },
  cartBtnTextActive: { color: COLORS.white },
  centerMsg: { alignItems: 'center', marginTop: 60 },
  errorText: { color: 'red', marginBottom: 12 },
  retryBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: COLORS.white, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.muted },
  modalSafe: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accent },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  modalEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  modalEmptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalEmptySub: { fontSize: 13, color: COLORS.muted },
  modalList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  modalItemImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  modalItemInfo: { flex: 1 },
  modalItemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  modalItemBrand: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  modalItemPrice: { fontSize: 14, fontWeight: '800', color: COLORS.accent, marginTop: 4 },
  modalRemoveBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdecea', alignItems: 'center', justifyContent: 'center' },
  wishlistActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moveToCartBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  modalFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, gap: 12 },
  modalTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTotalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  modalTotalValue: { fontSize: 22, fontWeight: '900', color: COLORS.accent },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16 },
  checkoutBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});