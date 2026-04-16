import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  c2cBg: '#e0ede8',
  c2cText: '#3a7a5e',
  outfitBg: '#e8daf8',
  outfitText: '#6b3fa0',
};

const TABS = ['All', 'FASH', 'Marketplace', 'Outfits'];

const ALL_ITEMS = [
  { id: '1',  name: 'Birkin-Style Tote',      brand: 'FASH Originals',            price: '$189', icon: 'bag-personal',    source: 'fash' },
  { id: '2',  name: 'Straw Sun Hat',           brand: '@summer_closet · C2C',      price: '$34',  icon: 'hat-fedora',      source: 'c2c'  },
  { id: '3',  name: 'No.5 Fragrance',          brand: 'FASH Exclusive',            price: '$210', icon: 'bottle-tonic',    source: 'fash' },
  { id: '4',  name: 'Nude Block Heels',        brand: '@luxe_preloved · C2C',      price: '$58',  icon: 'shoe-heel',       source: 'c2c'  },
  { id: '5',  name: 'Silk Scarf',              brand: 'FASH Limited Edition',      price: '$75',  icon: 'scarf',           source: 'fash' },
  { id: '6',  name: 'Cat-Eye Sunglasses',      brand: '@style_vault · C2C',        price: '$22',  icon: 'sunglasses',      source: 'c2c'  },
  { id: '7',  name: 'Leather Gloves',          brand: 'FASH Originals',            price: '$49',  icon: 'hand-back-right', source: 'fash' },
  { id: '8',  name: 'Vintage Denim Jacket',    brand: '@retro_finds · C2C',        price: '$67',  icon: 'tshirt-crew',     source: 'c2c'  },
  { id: '9',  name: 'Pearl Necklace',          brand: 'FASH Jewellery',            price: '$95',  icon: 'necklace',        source: 'fash' },
  { id: '10', name: 'Linen Wide-Leg Pants',    brand: '@minimal.wardrobe · C2C',   price: '$41',  icon: 'human-male',      source: 'c2c'  },
];

const OUTFITS = [
  { id: 'o1', name: 'Summer Brunch Look', items: '3 items · Dress, Sandals, Tote', icon: 'flower' },
  { id: 'o2', name: 'Office Chic',        items: '4 items · Blazer, Trousers, Heels, Bag', icon: 'briefcase' },
];

const SourceBadge = ({ source }) => {
  if (source === 'fash') {
    return (
      <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
        <Text style={[styles.badgeText, { color: COLORS.white }]}>FASH</Text>
      </View>
    );
  }
  if (source === 'c2c') {
    return (
      <View style={[styles.badge, { backgroundColor: COLORS.c2cBg }]}>
        <Text style={[styles.badgeText, { color: COLORS.c2cText }]}>Marketplace</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: COLORS.outfitBg }]}>
      <Text style={[styles.badgeText, { color: COLORS.outfitText }]}>AI Outfit</Text>
    </View>
  );
};

const SavedCard = ({ item }) => (
  <TouchableOpacity style={styles.itemCard} activeOpacity={0.85}>
    <View style={styles.itemImg}>
      <MaterialCommunityIcons name={item.icon} size={32} color={COLORS.accent} />
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemBrand}>{item.brand}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <SourceBadge source={item.source} />
    </View>
    <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
      <Ionicons name="heart" size={20} color={COLORS.accent} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const OutfitCard = ({ item }) => (
  <TouchableOpacity style={styles.itemCard} activeOpacity={0.85}>
    <View style={[styles.itemImg, { backgroundColor: COLORS.outfitBg }]}>
      <MaterialCommunityIcons name={item.icon} size={32} color={COLORS.outfitText} />
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemBrand}>{item.items}</Text>
      <SourceBadge source="outfit" />
    </View>
    <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
      <Ionicons name="heart" size={20} color={COLORS.accent} />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = () => {
    if (activeTab === 'FASH')        return ALL_ITEMS.filter(i => i.source === 'fash');
    if (activeTab === 'Marketplace') return ALL_ITEMS.filter(i => i.source === 'c2c');
    if (activeTab === 'Outfits')     return [];
    return ALL_ITEMS;
  };

  const showOutfits = activeTab === 'Outfits' || activeTab === 'All';

  const totalCount = {
    'All': ALL_ITEMS.length + OUTFITS.length,
    'FASH': ALL_ITEMS.filter(i => i.source === 'fash').length,
    'Marketplace': ALL_ITEMS.filter(i => i.source === 'c2c').length,
    'Outfits': OUTFITS.length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <Text style={styles.headerSub}>Your wishlist & favorites</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
                <Text style={styles.tabCount}> {totalCount[tab]}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Outfits section */}
        {showOutfits && (
          <>
            <Text style={styles.sectionLabel}>Saved Outfits</Text>
            {OUTFITS.map(item => <OutfitCard key={item.id} item={item} />)}
          </>
        )}

        {/* Items section */}
        {filteredItems().length > 0 && (
          <>
            {showOutfits && <Text style={styles.sectionLabel}>Saved Items</Text>}
            {filteredItems().map(item => <SavedCard key={item.id} item={item} />)}
          </>
        )}

        {/* Empty state */}
        {filteredItems().length === 0 && !showOutfits && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={52} color={COLORS.card} />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>
              Browse the marketplace and tap{' '}
              <Ionicons name="heart-outline" size={13} color={COLORS.muted} />{' '}
              to save items here.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },

  tabsWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 14 },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 2 },
  tabActive: { borderBottomColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: COLORS.accent },
  tabCount: { fontSize: 11, fontWeight: '400' },

  scrollContent: { padding: 14, paddingBottom: 50 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    marginTop: 10, marginBottom: 10,
    textTransform: 'uppercase', letterSpacing: 0.9,
  },

  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  itemImg: {
    width: 68,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#dfc8c5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  itemBrand: { fontSize: 11, color: COLORS.muted },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },

  badge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  heartBtn: { padding: 8 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
});