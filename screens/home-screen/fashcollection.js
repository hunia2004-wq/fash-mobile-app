import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Soirée', 'Suits', 'Umrah & Hajj', 'Kids'];

const ALL_PRODUCTS = [
  {
    id: '1',
    name: 'White Abaya',
    brand: 'FASH Originals',
    price: '$250',
    category: 'Umrah & Hajj',
    image: require('./images/whiteabaya.png'),
    badge: null,
  },
  {
    id: '3',
    name: 'Burgundy Soirée Dress',
    brand: 'FASH Exclusive',
    price: '$380',
    category: 'Soirée',
    image: require('./images/reddress.png'),
    badge: 'New',
  },
  {
    id: '5',
    name: 'TinkerBell Kids Costume',
    brand: 'FASH Originals',
    price: '$150',
    category: 'Kids',
    image: require('./images/tinkerbell.png'),
    badge: 'Sale',
  },
];

// ── Product card — mirrors WardrobeCard exactly ───────────────────
const ProductCard = ({ item }) => {
  const [saved, setSaved] = useState(false);

  return (
    <TouchableOpacity style={styles.wCard} activeOpacity={0.85}>
      <View style={styles.wCardImg}>
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* FASH badge — bottom left */}
        <View style={styles.fashBadge}>
          <Text style={styles.fashBadgeText}>FASH</Text>
        </View>

        {/* New / Sale badge — top right, same as wardrobe badge */}
        {item.badge && (
          <View style={styles.wCardBadge}>
            <Text style={styles.wCardBadgeText}>{item.badge}</Text>
          </View>
        )}

        {/* Heart save — top left */}
        <TouchableOpacity
          style={styles.heartOverlay}
          onPress={() => setSaved(s => !s)}
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
        <Text style={styles.wCardName}>{item.name}</Text>
        <View style={styles.wCardBottom}>
          <Text style={styles.wCardPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.bagBtn} activeOpacity={0.85}>
            <Ionicons name="bag-handle-outline" size={13} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Coming-soon placeholder — for Suits ──────────────────────────
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

// ── Main screen ───────────────────────────────────────────────────
export default function FashCollectionScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat    = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Show suits placeholder only when searching nothing & category allows it
  const showSuits =
    search.length === 0 &&
    (activeCategory === 'All' || activeCategory === 'Suits');

  const totalVisible = filtered.length + (showSuits ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* ── Header — back button style matching 2FA screen ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FASH Collection</Text>
        {/* balance right side — same trick as 2FA */}
        <View style={{ width: 40 }} />
      </View>

      {/* ── Search bar ── */}
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
        {/* ── Category chips — identical to wardrobe.js ── */}
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

        {/* ── No search results ── */}
        {filtered.length === 0 && !showSuits && (
          <View style={styles.emptyState}>
            <Feather name="search" size={42} color="#F2E6E3" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try a different keyword or category</Text>
          </View>
        )}

        {/* ── Product grid — identical layout to wardrobe.js ── */}
        {(filtered.length > 0 || showSuits) && (
          <View style={styles.grid}>
            {filtered.map(item => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard item={item} />
              </View>
            ))}
            {showSuits && (
              <View style={styles.gridItem}>
                <ComingSoonCard />
              </View>
            )}
          </View>
        )}

        {/* ── Promo strip ── */}
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

// ── Styles ────────────────────────────────────────────────────────
const CARD_WIDTH = (width - 44) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // ── Header — matches 2FA screen exactly ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    fontSize: 28,
    color: '#C17C74',
    lineHeight: 32,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#C17C74',
    pointerEvents: 'none',
  },

  // Search
  searchRow: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(193,124,116,0.18)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c2c2c',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  // ── Chips — copy-pasted from wardrobe.js ──
  chipsRow: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C17C74',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#C17C74',
  },
  chipText: {
    fontSize: 12,
    color: '#C17C74',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },

  // ── Grid — copy-pasted from wardrobe.js ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
  },
  gridItem: {
    width: CARD_WIDTH,
  },

  // ── Card — mirrors WardrobeCard ──
  wCard: {
    backgroundColor: '#F2E6E3',
    borderRadius: 18,
    overflow: 'hidden',
  },
  wCardImg: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#F2E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // FASH label — bottom left
  fashBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#C17C74',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  fashBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // New / Sale — top right (same style as wardrobe badge)
  wCardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#C17C74',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  wCardBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Heart — top left
  heartOverlay: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wCardInfo: {
    padding: 10,
  },
  wCardBrand: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C17C74',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  wCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  wCardDetail: {
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  wCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  wCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C17C74',
  },
  bagBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#C17C74',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty search state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  emptySub: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Promo strip
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2E6E3',
    marginHorizontal: 14,
    marginTop: 20,
    borderRadius: 14,
    padding: 14,
  },
  promoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  promoBtn: {
    backgroundColor: '#C17C74',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  promoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});