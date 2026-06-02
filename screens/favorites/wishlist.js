import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSaved, removeSaved, getListingById } from '../../services/authService';
import { wp, hp, fp } from '../../utils/responsive';

const TABS = ['All', 'FASH', 'Marketplace'];

const SourceBadge = ({ itemType }) => {
  if (itemType === 'collection') {
    return <View style={[styles.badge, { backgroundColor: '#C17C74' }]}><Text style={[styles.badgeText, { color: 'white' }]}>FASH</Text></View>;
  }
  return <View style={[styles.badge, { backgroundColor: '#e8dedd' }]}><Text style={[styles.badgeText, { color: '#7a4f4a' }]}>Marketplace</Text></View>;
};

const SavedCard = ({ savedItem, onRemove, onOpen, onAddToCart, cartAdded, navigation }) => {
  const { item, itemType, itemId } = savedItem;
  const imageUri = item?.image ?? item?.images?.[0] ?? null;
  const isCollection = itemType === 'collection';

  return (
    <TouchableOpacity style={styles.itemCard} onPress={() => onOpen(savedItem)} activeOpacity={0.88}>
      <View style={styles.itemImg}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="hanger" size={wp(32)} color="#C17C74" />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item?.title ?? item?.name ?? '—'}</Text>
        <Text style={styles.itemBrand}>
          {itemType === 'marketplace' && item?.handle ? `${item.handle} · C2C` : item?.brand ?? '—'}
        </Text>
        <Text style={styles.itemPrice}>
          EGP {item?.price ?? '—'}
          {isCollection && <Text style={styles.perDay}> / day</Text>}
        </Text>
        <SourceBadge itemType={itemType} />
        <View style={styles.actionRow}>
          {isCollection ? (
            <TouchableOpacity style={styles.cartBtn} onPress={(e) => { e.stopPropagation(); onOpen(savedItem); }} activeOpacity={0.85}>
              <Ionicons name="calendar-outline" size={wp(12)} color="white" style={{ marginRight: wp(4) }} />
              <Text style={styles.cartBtnText}>Rent</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.cartBtn, cartAdded && styles.cartBtnAdded]}
              onPress={(e) => { e.stopPropagation(); if (cartAdded) { navigation.navigate('MainCart'); } else { onAddToCart(savedItem); } }}
              activeOpacity={0.85}
            >
              <Ionicons name={cartAdded ? 'cart' : 'cart-outline'} size={wp(12)} color="white" style={{ marginRight: wp(4) }} />
              <Text style={styles.cartBtnText}>{cartAdded ? 'View Cart' : 'Add to Cart'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewBtn} onPress={(e) => { e.stopPropagation(); onOpen(savedItem); }} activeOpacity={0.85}>
            <Text style={styles.viewBtnText}>View</Text>
            <Ionicons name="chevron-forward" size={wp(12)} color="#C17C74" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.heartBtn} onPress={(e) => { e.stopPropagation(); onRemove(itemId); }} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="heart" size={wp(20)} color="#E05C5C" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function SavedScreen({ navigation }) {
  const { getToken } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [activeTab, setActiveTab] = useState('All');
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const token = await getToken();
      if (!token) return;
      const data = await getSaved(token);
      setSavedItems(data.savedItems ?? data ?? []);
      hasFetched.current = true;
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useFocusEffect(useCallback(() => { if (!hasFetched.current) fetchSaved(); }, [fetchSaved]));

  const handleRemove = async (itemId) => {
    setSavedItems(prev => prev.filter(s => s.itemId.toString() !== itemId.toString()));
    try { const token = await getToken(); await removeSaved(token, itemId); }
    catch (err) { console.error('Remove failed:', err.message); fetchSaved(); }
  };

  const handleOpen = async (savedItem) => {
    const { item, itemType, itemId } = savedItem;
    if (itemType === 'collection') {
      navigation.navigate('Fashproductsdetails', { item, isSaved: true });
    } else {
      try {
        const fullItem = await getListingById(itemId);
        navigation.navigate('ProductDetails', { item: fullItem.listing ?? fullItem, isSaved: true });
      } catch { navigation.navigate('ProductDetails', { item, isSaved: true }); }
    }
  };

  const handleAddToCart = (savedItem) => {
    const itemId = savedItem.itemId;
    const item = savedItem.item;
    addToCart({ ...item, _id: itemId.toString() }, 'marketplace');
    navigation.navigate('MainCart');
  };

  const filteredItems = () => {
    if (activeTab === 'FASH') return savedItems.filter(i => i.itemType === 'collection');
    if (activeTab === 'Marketplace') return savedItems.filter(i => i.itemType === 'marketplace');
    return savedItems;
  };

  const totalCount = {
    'All': savedItems.length,
    'FASH': savedItems.filter(i => i.itemType === 'collection').length,
    'Marketplace': savedItems.filter(i => i.itemType === 'marketplace').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <Text style={styles.headerSub}>Your wishlist & favorites</Text>
      </View>
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}<Text style={styles.tabCount}> {totalCount[tab]}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#C17C74" style={{ marginTop: hp(40) }} />
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wifi-off" size={wp(40)} color="#C17C74" />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySub}>{error}</Text>
            <TouchableOpacity onPress={fetchSaved} style={styles.retryBtn}><Text style={styles.retryText}>Try again</Text></TouchableOpacity>
          </View>
        ) : filteredItems().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={wp(52)} color="#F2E6E3" />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>Browse the marketplace or FASH collection and tap <Ionicons name="heart-outline" size={wp(13)} color="#888888" /> to save items here.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{filteredItems().length} item{filteredItems().length !== 1 ? 's' : ''}</Text>
            {filteredItems().map(savedItem => (
              <SavedCard
                key={savedItem.savedId ?? savedItem.itemId}
                savedItem={savedItem}
                onRemove={handleRemove}
                onOpen={handleOpen}
                onAddToCart={handleAddToCart}
                cartAdded={isInCart(savedItem.itemId)}
                navigation={navigation}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo: { width: wp(120), height: hp(50) },
  titleHeader: { backgroundColor: '#F5F5F5', paddingHorizontal: wp(20) },
  headerTitle: { fontSize: fp(20), fontWeight: '700', color: '#C17C74' },
  headerSub: { fontSize: fp(13), color: '#888888', marginTop: hp(2), marginBottom: hp(10) },
  tabsWrapper: { backgroundColor: '#F5F5F5', borderBottomWidth: 0.5, borderBottomColor: '#e0d0ce' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: wp(14) },
  tab: { paddingHorizontal: wp(16), paddingVertical: hp(12), borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: wp(2) },
  tabActive: { borderBottomColor: '#C17C74' },
  tabText: { fontSize: fp(13), fontWeight: '600', color: '#888888' },
  tabTextActive: { color: '#C17C74' },
  tabCount: { fontSize: fp(11), fontWeight: '400' },
  scrollContent: { padding: wp(14), paddingBottom: hp(50) },
  sectionLabel: { fontSize: fp(11), fontWeight: '700', color: '#C17C74', marginTop: hp(10), marginBottom: hp(10), textTransform: 'uppercase', letterSpacing: 0.9 },
  itemCard: { backgroundColor: '#F2E6E3', borderRadius: wp(18), flexDirection: 'row', padding: wp(12), marginBottom: hp(10), alignItems: 'flex-start', gap: wp(12) },
  itemImg: { width: wp(80), height: hp(90), borderRadius: wp(14), backgroundColor: '#dfc8c5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%', borderRadius: wp(14) },
  itemInfo: { flex: 1, gap: hp(3) },
  itemName: { fontSize: fp(14), fontWeight: '600', color: '#2c2c2c' },
  itemBrand: { fontSize: fp(11), color: '#888888' },
  itemPrice: { fontSize: fp(14), fontWeight: '700', color: '#C17C74' },
  perDay: { fontSize: fp(11), color: '#888', fontWeight: '400' },
  badge: { alignSelf: 'flex-start', marginTop: hp(2), paddingHorizontal: wp(9), paddingVertical: hp(3), borderRadius: wp(7) },
  badgeText: { fontSize: fp(10), fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: hp(8) },
  cartBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C17C74', borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: hp(6) },
  cartBtnAdded: { backgroundColor: '#a0635d' },
  cartBtnText: { fontSize: fp(11), fontWeight: '700', color: 'white' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: wp(2), backgroundColor: 'white', borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: hp(6), borderWidth: 1, borderColor: 'rgba(193,124,116,0.25)' },
  viewBtnText: { fontSize: fp(11), fontWeight: '600', color: '#C17C74' },
  heartBtn: { padding: wp(4), marginTop: hp(2) },
  emptyState: { alignItems: 'center', paddingTop: hp(80), paddingHorizontal: wp(40), gap: hp(12) },
  emptyTitle: { fontSize: fp(17), fontWeight: '600', color: '#2c2c2c' },
  emptySub: { fontSize: fp(13), color: '#888888', textAlign: 'center', lineHeight: hp(20) },
  retryBtn: { paddingHorizontal: wp(20), paddingVertical: hp(8), backgroundColor: '#C17C74', borderRadius: wp(12) },
  retryText: { color: 'white', fontSize: fp(13), fontWeight: '600' },
});