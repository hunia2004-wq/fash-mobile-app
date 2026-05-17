import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, Image, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSaved, saveNewItem, removeSaved, getCollectionItems } from '../../services/authService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;
const CATEGORIES = ['All', 'Soirée', 'Suits', 'Umrah & Hajj', 'Kids Costumes'];

const ProductCard = ({ item, saved, onToggleSave, onPress }) => (
  <TouchableOpacity style={styles.wCard} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.wCardImg}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Feather name="image" size={36} color="#C17C74" />
      )}

      <View style={styles.fashBadge}>
        <Text style={styles.fashBadgeText}>FASH</Text>
      </View>

      {item.isNew && (
        <View style={styles.wCardBadge}>
          <Text style={styles.wCardBadgeText}>New</Text>
        </View>
      )}

      {/* Heart — tapping saves AND navigates to wishlist, exactly like marketplace */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={(e) => { e.stopPropagation(); onToggleSave(item._id); }}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={16}
          color={saved ? '#E05C5C' : '#C17C74'}
        />
      </TouchableOpacity>
    </View>

    <View style={styles.wCardInfo}>
      <Text style={styles.wCardBrand}>{item.brand}</Text>
      <Text style={styles.wCardName}>{item.title}</Text>
      <View style={styles.wCardBottom}>
        <Text style={styles.wCardPrice}>EGP {item.price}</Text>
        <Text style={styles.perDay}>/ day</Text>
      </View>
      <TouchableOpacity
        style={styles.rentBtn}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar-outline" size={13} color="white" style={{ marginRight: 5 }} />
        <Text style={styles.rentBtnText}>Rent Now</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const ComingSoonCard = () => (
  <View style={[styles.wCard, { opacity: 0.6 }]}>
    <View style={[styles.wCardImg, { backgroundColor: '#e8ecf5' }]}>
      <Feather name="clock" size={36} color="#C17C74" />
    </View>
    <View style={styles.wCardInfo}>
      <Text style={styles.wCardBrand}>FASH Originals</Text>
      <Text style={styles.wCardName}>Suits</Text>
      <Text style={styles.wCardDetail}>Coming soon</Text>
    </View>
  </View>
);

export default function FashCollectionScreen({ navigation }) {
  const { getToken } = useAuth();
  const { cartCount } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search,         setSearch]         = useState('');
  const [items,          setItems]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [savedMap,       setSavedMap]       = useState({});
  const [showSearch,     setShowSearch]     = useState(false);
  const [notifyEnabled,  setNotifyEnabled]  = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollectionItems({ category: activeCategory, search });
      setItems(data.items ?? data ?? []);
    } catch (err) {
      console.error('Failed to fetch collection:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const delay = setTimeout(() => fetchItems(), search ? 400 : 0);
    return () => clearTimeout(delay);
  }, [fetchItems]);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getSaved(token);
        const map = {};
        (data.savedItems ?? data ?? [])
          .filter(s => s.itemType === 'collection')
          .forEach(s => { map[s.itemId] = true; });
        setSavedMap(map);
      } catch (err) {
        console.error('Failed to load saved:', err.message);
      }
    };
    loadSaved();
  }, []);

  // ── heart: save to backend then navigate to Saved tab (same as marketplace) ──
  const handleToggleSave = async (id) => {
    const alreadySaved = savedMap[id];
    // Optimistic toggle
    setSavedMap(prev => ({ ...prev, [id]: !alreadySaved }));
    try {
      const token = await getToken();
      if (alreadySaved) {
        await removeSaved(token, id);
      } else {
        await saveNewItem(token, id, 'collection');
        // Navigate to the Saved tab so the user sees their wishlist — mirrors marketplace behaviour
        navigation.navigate('SavedTab');
      }
    } catch (err) {
      setSavedMap(prev => ({ ...prev, [id]: alreadySaved }));
      console.error('Save failed:', err.message);
    }
  };

  const handleNotify = () => {
    if (notifyEnabled) {
      Alert.alert('Notifications Off', 'You will no longer receive alerts for new FASH drops.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn Off', style: 'destructive', onPress: () => setNotifyEnabled(false) },
      ]);
    } else {
      Alert.alert('Notify Me 🎉', "You'll be notified when new FASH Collection drops arrive!", [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Notify Me', onPress: () => setNotifyEnabled(true) },
      ]);
    }
  };

  const showSuits =
    search.length === 0 &&
    (activeCategory === 'All' || activeCategory === 'Suits') &&
    !items.some(i => i.category === 'Suits');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>FASH Collection</Text>
            <Text style={styles.headerSub}>
              {loading ? 'Loading...' : `${items.length} items available`}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(v => !v)} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={20} color="#C17C74" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MainCart')} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={20} color="#C17C74" />
            {cartCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBarWrap}>
          <Ionicons name="search-outline" size={16} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search collection…"
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearch(''); }}>
            <Ionicons name="close" size={18} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#C17C74" style={{ marginTop: 40 }} />
        ) : items.length === 0 && !showSuits ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={42} color="#F2E6E3" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try a different keyword or category</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map(item => (
              <View key={item._id} style={styles.gridItem}>
                <ProductCard
                  item={item}
                  saved={!!savedMap[item._id]}
                  onToggleSave={handleToggleSave}
                  onPress={() => navigation.navigate('Fashproductsdetails', {
                    item,
                    isSaved: !!savedMap[item._id],
                  })}
                />
              </View>
            ))}
            {showSuits && (
              <View style={styles.gridItem}>
                <ComingSoonCard />
              </View>
            )}
          </View>
        )}

        {search.length === 0 && (
          <View style={styles.promoBanner}>
            <Ionicons name="sparkles-outline" size={16} color="#C17C74" style={{ marginRight: 10 }} />
            <Text style={styles.promoText}>New drops added every week</Text>
            <TouchableOpacity
              style={[styles.promoBtn, notifyEnabled && { backgroundColor: '#a0635d' }]}
              onPress={handleNotify}
              activeOpacity={0.85}
            >
              <Ionicons name={notifyEnabled ? 'notifications' : 'notifications-outline'} size={13} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.promoBtnText}>{notifyEnabled ? 'Notifying' : 'Notify me'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader:       { paddingBottom: 10, alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo:             { width: 120, height: 50 },
  backBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  headerTitle:      { fontSize: 20, fontWeight: '700', color: '#C17C74' },
  headerSub:        { fontSize: 13, color: '#888888' },
  headerActions:    { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn:          { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  badgeCount:       { position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#E05C5C', alignItems: 'center', justifyContent: 'center' },
  badgeCountText:   { fontSize: 9, fontWeight: '800', color: 'white' },
  searchBarWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', borderRadius: 12, paddingHorizontal: 12, height: 40, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)' },
  searchInput:      { flex: 1, fontSize: 14, color: '#2c2c2c' },
  scrollContent:    { paddingBottom: 32 },
  chipsRow:         { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, gap: 8, flexDirection: 'row' },
  chip:             { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)', backgroundColor: '#F2E6E3' },
  chipActive:       { backgroundColor: '#C17C74' },
  chipText:         { fontSize: 12, color: '#C17C74', fontWeight: '500' },
  chipTextActive:   { color: '#fff' },
  grid:             { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  gridItem:         { width: CARD_WIDTH },
  wCard:            { backgroundColor: '#F2E6E3', borderRadius: 18, overflow: 'hidden' },
  wCardImg:         { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  fashBadge:        { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#C17C74', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  fashBadgeText:    { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  wCardBadge:       { position: 'absolute', top: 10, left: 10, backgroundColor: '#C17C74', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  wCardBadgeText:   { color: '#fff', fontSize: 9, fontWeight: '700' },
  heartBtn:         {
    position: 'absolute', top: 10, right: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(193,124,116,0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  wCardInfo:        { padding: 10 },
  wCardBrand:       { fontSize: 9, fontWeight: '700', color: '#C17C74', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  wCardName:        { fontSize: 12, fontWeight: '600', color: '#2c2c2c' },
  wCardDetail:      { fontSize: 10, color: '#888888', marginTop: 2 },
  wCardBottom:      { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 4 },
  wCardPrice:       { fontSize: 14, fontWeight: '800', color: '#C17C74' },
  perDay:           { fontSize: 10, color: '#888', fontWeight: '500' },
  rentBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 10, paddingVertical: 7, backgroundColor: '#C17C74' },
  rentBtnText:      { fontSize: 11, fontWeight: '700', color: 'white' },
  emptyState:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 10 },
  emptyTitle:       { fontSize: 17, fontWeight: '600', color: '#2c2c2c' },
  emptySub:         { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 20 },
  promoBanner:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', marginHorizontal: 14, marginTop: 20, borderRadius: 14, padding: 14 },
  promoText:        { flex: 1, fontSize: 13, fontWeight: '600', color: '#2c2c2c' },
  promoBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C17C74', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  promoBtnText:     { fontSize: 12, fontWeight: '700', color: '#fff' },
});