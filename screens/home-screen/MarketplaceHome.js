import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, TextInput, Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES } from './marketplacedata';
import { getAllListings } from '../../services/authService'; 

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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
    const delay = setTimeout(() => {
      fetchListings();
    }, searchQuery ? 400 : 0);
  
    return () => clearTimeout(delay);
  }, [fetchListings]);


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
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backBtn}>‹</Text>
  </TouchableOpacity>
  <View>
    <Text style={styles.headerTitle}>Marketplace</Text>
    <Text style={styles.headerSub}>
      {loading ? 'Loading...' : `${listings.length} listings near you`}
    </Text>
  </View>
</View>

            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)}>
                <Ionicons name="search-outline" size={20} color={COLORS.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('AddListingScreen')}
              >
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
                onPress={() => navigation.navigate('ProductDetail', { item })}
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
                </View>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemBrand}>
                    {item.brand || 'No brand'} · {item.size || 'N/A'}
                  </Text>
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>EGP {item.price}</Text>
                    {item.originalPrice && (
                      <Text style={styles.itemOriginalPrice}>EGP {item.originalPrice}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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