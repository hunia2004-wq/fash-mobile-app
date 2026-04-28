import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES } from './marketplacedata';
import { getAllListings } from '../../services/authService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ConditionBadge = ({ condition }) => (
  <View
    style={[
      styles.conditionBadge,
      {
        backgroundColor:
          condition === 'Like New' ? '#e8f5e9' : '#fff8e1',
      },
    ]}
  >
    <Text
      style={[
        styles.conditionText,
        {
          color:
            condition === 'Like New' ? '#388e3c' : '#f9a825',
        },
      ]}
    >
      {condition}
    </Text>
  </View>
);

export default function MarketplaceScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [savedItems, setSavedItems] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const cartCount = Object.keys(cartItems).length;
  const wishlistCount = Object.keys(wishlistItems).length;

  const cartList = listings.filter((item) => cartItems[item._id]);
  const wishlistList = listings.filter(
    (item) => wishlistItems[item._id]
  );

  const cartTotal = cartList.reduce(
    (sum, item) => sum + parseFloat(item.price || 0),
    0
  );

  const toggleHeart = (id, e) => {
    e && e.stopPropagation();

    setSavedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    setWishlistItems((prev) => {
      const updated = { ...prev };

      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
      }

      return updated;
    });
  };

  const toggleCart = (id, e) => {
    e && e.stopPropagation();

    setCartItems((prev) => {
      const updated = { ...prev };

      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
      }

      return updated;
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    setSavedItems((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const moveToCart = (id) => {
    setCartItems((prev) => ({
      ...prev,
      [id]: true,
    }));

    removeFromWishlist(id);
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(listings.length === 0);
      setError(null);

      const data = await getAllListings({
        category:
          activeCategory === 'All'
            ? undefined
            : activeCategory,
        search: searchQuery,
      });

      setListings(
        Array.isArray(data)
          ? data
          : data.listings || []
      );
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
    const delay = setTimeout(
      () => fetchListings(),
      searchQuery ? 400 : 0
    );

    return () => clearTimeout(delay);
  }, [fetchListings]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: { paddingBottom: 10, alignItems: 'center' },
  logo: { width: 120, height: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  categoryScroll: { flexGrow: 0, maxHeight: 50 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 6 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  categoryPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  categoryTextActive: { color: COLORS.white },
  scrollContent: { paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  itemCard: { width: CARD_WIDTH, backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden' },
  itemImageBox: { height: 170, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  itemImage: { width: '100%', height: '100%' },
  badgeWrap: { position: 'absolute', top: 10, left: 10 },
  conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  conditionText: { fontSize: 10, fontWeight: '700' },
  itemInfo: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700' },
  itemBrand: { fontSize: 11, color: COLORS.accent },
  itemDescription: { fontSize: 11, color: COLORS.muted },
  priceRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700' },
  itemOriginalPrice: { fontSize: 11, textDecorationLine: 'line-through', color: COLORS.muted },
  centerMsg: { alignItems: 'center', marginTop: 60 },
  errorText: { color: 'red', marginBottom: 12 },
  retryBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: COLORS.white, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.muted },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  backBtn: { fontSize: 28, color: COLORS.accent, lineHeight: 32 },
});