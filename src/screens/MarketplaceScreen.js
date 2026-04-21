import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES, SAMPLE_ITEMS } from './marketplaceData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const TIPS = [
  {
    icon: 'storefront-outline',
    lib: 'ion',
    title: 'Browse listings',
    sub: 'Shop from FASH & C2C sellers',
  },
  {
    icon: 'heart-outline',
    lib: 'ion',
    title: 'Save favourites',
    sub: 'Wishlist items you love',
  },
  {
    icon: 'add-circle-outline',
    lib: 'ion',
    title: 'List your items',
    sub: 'Sell clothes from your wardrobe',
  },
];

const TipIcon = ({ icon, lib }) => {
  if (lib === 'mci')
    return <MaterialCommunityIcons name={icon} size={20} color={COLORS.accent} />;
  return <Ionicons name={icon} size={20} color={COLORS.accent} />;
};

const ConditionBadge = ({ condition }) => (
  <View style={[
    styles.conditionBadge,
    { backgroundColor: condition === 'Like New' ? '#e8f5e9' : '#fff8e1' }
  ]}>
    <Text style={[
      styles.conditionText,
      { color: condition === 'Like New' ? '#388e3c' : '#f9a825' }
    ]}>
      {condition}
    </Text>
  </View>
);

export default function MarketplaceScreen({ navigation }) {
  const [savedItems, setSavedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const toggleSave = (id, e) => {
    e.stopPropagation();
    setSavedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = useMemo(() => {
    return SAMPLE_ITEMS.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const hasItems = filteredItems.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('./images/Blacklogo.png')}
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
            <View>
              <Text style={styles.headerTitle}>Marketplace</Text>
              <Text style={styles.headerSub}>{SAMPLE_ITEMS.length} listings near you</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setShowSearch(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="search-outline" size={20} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddListing')}
              >
                <Feather name="plus" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!hasItems ? (
          <>
            <View style={styles.emptyHero}>
              <View style={styles.iconRing}>
                <Ionicons name="storefront-outline" size={48} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>
                Discover pre-loved fashion or list your own items for sale
              </Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddListing')}
              >
                <Feather name="plus" size={16} color={COLORS.white} style={{ marginRight: 7 }} />
                <Text style={styles.btnPrimaryText}>Add a Listing</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>What you can do</Text>
            {TIPS.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <View style={styles.tipIconWrap}>
                  <TipIcon icon={tip.icon} lib={tip.lib} />
                </View>
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipSub}>{tip.sub}</Text>
                </View>
                <Feather name="chevron-right" size={14} color={COLORS.muted} />
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>
              {activeCategory === 'All' ? 'Recent listings' : activeCategory} · {filteredItems.length} items
            </Text>
            <View style={styles.grid}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('ProductDetail', { item })}
                >
                  {/* Image */}
                  <View style={styles.itemImageBox}>
                    {item.image ? (
                      <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                      <MaterialCommunityIcons name="hanger" size={40} color={COLORS.accent} />
                    )}
                    {/* Condition badge */}
                    <View style={styles.badgeWrap}>
                      <ConditionBadge condition={item.condition} />
                    </View>
                    {/* Heart */}
                    <TouchableOpacity
                      style={styles.heartBtn}
                      onPress={(e) => toggleSave(item.id, e)}
                      activeOpacity={0.8}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={savedItems[item.id] ? 'heart' : 'heart-outline'}
                        size={18}
                        color={savedItems[item.id] ? '#E05C5C' : COLORS.muted}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemBrand} numberOfLines={1}>{item.brand} · {item.size}</Text>
                    <Text style={styles.itemDescription} numberOfLines={1}>{item.description}</Text>

                    {/* Location */}
                    <View style={styles.itemLocationRow}>
                      <Ionicons name="location-outline" size={11} color={COLORS.muted} />
                      <Text style={styles.itemLocation}>{item.location}</Text>
                    </View>

                    {/* Price row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>{item.price}</Text>
                      <Text style={styles.itemOriginalPrice}>{item.originalPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  logoHeader: {
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  logo: { width: 120, height: 50 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  categoryRow: { paddingHorizontal: 16, paddingBottom: 14 },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  categoryPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  categoryTextActive: { color: COLORS.white },

  scrollContent: { paddingBottom: 48 },

  emptyHero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 52,
    paddingBottom: 40,
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
  },
  btnPrimaryText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tipSub: { fontSize: 12, color: COLORS.muted, marginTop: 3 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  itemCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImageBox: {
    height: 170,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: { width: '100%', height: '100%' },

  badgeWrap: { position: 'absolute', top: 10, left: 10 },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionText: { fontSize: 10, fontWeight: '700' },

  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  itemInfo: { padding: 10 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  itemBrand: { fontSize: 11, color: COLORS.accent, marginTop: 2, fontWeight: '600' },
  itemDescription: { fontSize: 11, color: COLORS.muted, marginTop: 3 },

  itemLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 2 },
  itemLocation: { fontSize: 10, color: COLORS.muted },

  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  itemOriginalPrice: {
    fontSize: 11,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
});
