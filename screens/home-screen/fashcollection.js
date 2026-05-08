import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, Image, TextInput, ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSaved, saveNewItem, removeSaved, getCollectionItems } from '../../services/authService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;
const CATEGORIES = ['All', 'Soirée', 'Suits', 'Umrah & Hajj', 'Kids'];

const ProductCard = ({ item, saved, onToggleSave, onAddToCart, inCart }) => (
  <TouchableOpacity style={styles.wCard} activeOpacity={0.85}>
    <View style={styles.wCardImg}>
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
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

      <TouchableOpacity
        style={styles.heartOverlay}
        onPress={() => onToggleSave(item._id)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={14}
          color={saved ? '#C17C74' : '#fff'}
        />
      </TouchableOpacity>
    </View>

    <View style={styles.wCardInfo}>
      <Text style={styles.wCardBrand}>{item.brand}</Text>
      <Text style={styles.wCardName}>{item.title}</Text>
      <View style={styles.wCardBottom}>
        <Text style={styles.wCardPrice}>EGP {item.price}</Text>
        <TouchableOpacity
          style={[styles.bagBtn, inCart && { backgroundColor: '#888' }]}
          onPress={onAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons
            name={inCart ? 'checkmark' : 'bag-handle-outline'}
            size={13}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
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
  const { addToCart, isInCart } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search,         setSearch]         = useState('');
  const [items,          setItems]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [savedMap,       setSavedMap]       = useState({});

  //  fetch items 
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

  //  load saved state
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

  //  toggle save
  const handleToggleSave = async (id) => {
    const alreadySaved = savedMap[id];
    setSavedMap(prev => ({ ...prev, [id]: !alreadySaved }));
    try {
      const token = await getToken();
      if (alreadySaved) {
        await removeSaved(token, id);
      } else {
        await saveNewItem(token, id, 'collection');
      }
    } catch (err) {
      setSavedMap(prev => ({ ...prev, [id]: alreadySaved }));
      console.error('Save failed:', err.message);
    }
  };

  const showSuits =
    search.length === 0 &&
    (activeCategory === 'All' || activeCategory === 'Suits') &&
    !items.some(i => i.category === 'Suits');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FASH Collection</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Feather name="search" size={14} color="#C17C74" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search collection…"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
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
                  onAddToCart={() => addToCart(item, 'collection')}
                  inCart={isInCart(item._id)}
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
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.85}>
              <Text style={styles.promoBtnText}>Notify me</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader:     { paddingBottom: 10, alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo:           { width: 120, height: 50 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  searchRow:      { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 2 },
  searchBar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 0.5, borderColor: 'rgba(193,124,116,0.18)' },
  searchInput:    { flex: 1, fontSize: 14, color: '#2c2c2c' },
  scrollContent:  { paddingBottom: 32 },
  chipsRow:       { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, gap: 8, flexDirection: 'row' },
  chip:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)', backgroundColor: '#F2E6E3' },
  chipActive:     { backgroundColor: '#C17C74' },
  chipText:       { fontSize: 12, color: '#C17C74', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  gridItem:       { width: CARD_WIDTH },
  wCard:          { backgroundColor: '#F2E6E3', borderRadius: 18, overflow: 'hidden' },
  wCardImg:       { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  fashBadge:      { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#C17C74', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  fashBadgeText:  { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  wCardBadge:     { position: 'absolute', top: 10, right: 10, backgroundColor: '#C17C74', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  wCardBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  heartOverlay:   { position: 'absolute', top: 9, left: 9, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  wCardInfo:      { padding: 10 },
  wCardBrand:     { fontSize: 9, fontWeight: '700', color: '#C17C74', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  wCardName:      { fontSize: 12, fontWeight: '600', color: '#2c2c2c' },
  wCardDetail:    { fontSize: 10, color: '#888888', marginTop: 2 },
  wCardBottom:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  wCardPrice:     { fontSize: 14, fontWeight: '800', color: '#C17C74' },
  bagBtn:         { width: 26, height: 26, borderRadius: 8, backgroundColor: '#C17C74', alignItems: 'center', justifyContent: 'center' },
  emptyState:     { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 10 },
  emptyTitle:     { fontSize: 17, fontWeight: '600', color: '#2c2c2c' },
  emptySub:       { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 20 },
  promoBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', marginHorizontal: 14, marginTop: 20, borderRadius: 14, padding: 14 },
  promoText:      { flex: 1, fontSize: 13, fontWeight: '600', color: '#2c2c2c' },
  promoBtn:       { backgroundColor: '#C17C74', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  promoBtnText:   { fontSize: 12, fontWeight: '700', color: '#fff' },
});