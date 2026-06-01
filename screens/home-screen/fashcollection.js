import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getSaved, saveNewItem, removeSaved, getCollectionItems } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { wp, hp, fp, SCREEN } from '../../utils/responsive';

const CARD_WIDTH = (SCREEN.width - wp(44)) / 2;
const CATEGORIES = ['All', 'Soirée', 'Suits', 'Umrah & Hajj', 'Kids Costumes'];

const ProductCard = ({ item, saved, onToggleSave, onPress, t, inCart }) => (
  <TouchableOpacity style={styles.wCard} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.wCardImg}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Feather name="image" size={wp(36)} color="#C17C74" />
      )}
      <View style={styles.fashBadge}>
        <Text style={styles.fashBadgeText}>FASH</Text>
      </View>
      {item.isNew && (
        <View style={styles.wCardBadge}>
          <Text style={styles.wCardBadgeText}>{t('badge_new')}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={(e) => { e.stopPropagation(); onToggleSave(item._id); }}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={wp(16)} color={saved ? '#E05C5C' : '#C17C74'} />
      </TouchableOpacity>
    </View>
    <View style={styles.wCardInfo}>
      <Text style={styles.wCardBrand}>{item.brand}</Text>
      <Text style={styles.wCardName}>{item.title}</Text>
      <View style={styles.wCardBottom}>
        <Text style={styles.wCardPrice}>EGP {item.rentalPrice ?? item.price}</Text>
        <Text style={styles.perDay}>{t('per_day')}</Text>
      </View>
    </View>
    <TouchableOpacity
      style={[styles.rentBtn, inCart && { backgroundColor: '#a0635d' }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={inCart ? "checkmark-circle-outline" : "calendar-outline"} size={wp(13)} color="white" style={{ marginRight: wp(5) }} />
      <Text style={styles.rentBtnText}>{inCart ? t('in_cart') : t('rent_now')}</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const ComingSoonCard = ({ t }) => (
  <View style={[styles.wCard, { opacity: 0.6 }]}>
    <View style={[styles.wCardImg, { backgroundColor: '#e8ecf5' }]}>
      <Feather name="clock" size={wp(36)} color="#C17C74" />
    </View>
    <View style={styles.wCardInfo}>
      <Text style={styles.wCardBrand}>FASH Originals</Text>
      <Text style={styles.wCardName}>Suits</Text>
      <Text style={styles.wCardDetail}>{t('coming_soon')}</Text>
    </View>
  </View>
);

export default function FashCollectionScreen({ navigation }) {
  const { getToken } = useAuth();
  const { cartCount, isInCart } = useCart();
  const { t } = useTranslation();

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedMap, setSavedMap] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

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

  const handleToggleSave = async (id) => {
    const alreadySaved = savedMap[id];
    setSavedMap(prev => ({ ...prev, [id]: !alreadySaved }));
    try {
      const token = await getToken();
      if (alreadySaved) { await removeSaved(token, id); }
      else { await saveNewItem(token, id, 'collection'); }
    } catch (err) {
      setSavedMap(prev => ({ ...prev, [id]: alreadySaved }));
      console.error('Save failed:', err.message);
    }
  };

  const handleNotify = () => {
    if (notifyEnabled) {
      Alert.alert(t('notifications_off'), t('notifications_off_msg'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('turn_off'), style: 'destructive', onPress: () => setNotifyEnabled(false) },
      ]);
    } else {
      Alert.alert(t('notify_me'), t('notify_me_msg'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('yes_notify'), onPress: () => setNotifyEnabled(true) },
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{t('fash_collection')}</Text>
            <Text style={styles.headerSub}>
              {loading ? t('loading') : `${items.length} ${t('items_available')}`}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(v => !v)} activeOpacity={0.8}>
            <Ionicons name="search-outline" size={wp(20)} color="#C17C74" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MainCart')} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={wp(20)} color="#C17C74" />
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
          <Ionicons name="search-outline" size={wp(16)} color="#888" style={{ marginRight: wp(8) }} />
          <TextInput
            placeholder={t('search_collection')}
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearch(''); }}>
            <Ionicons name="close" size={wp(18)} color="#888" />
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
          <ActivityIndicator size="large" color="#C17C74" style={{ marginTop: hp(40) }} />
        ) : items.length === 0 && !showSuits ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={wp(42)} color="#F2E6E3" />
            <Text style={styles.emptyTitle}>{t('no_items_found')}</Text>
            <Text style={styles.emptySub}>{t('no_items_sub')}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map(item => (
              <View key={item._id} style={styles.gridItem}>
                <ProductCard
                  item={item}
                  saved={!!savedMap[item._id]}
                  onToggleSave={handleToggleSave}
                  t={t}
                  inCart={isInCart(item._id)}
                  onPress={() => navigation.navigate('Fashproductsdetails', { item, isSaved: !!savedMap[item._id] })}
                />
              </View>
            ))}
            {showSuits && (
              <View style={styles.gridItem}>
                <ComingSoonCard t={t} />
              </View>
            )}
          </View>
        )}

        {search.length === 0 && (
          <View style={styles.promoBanner}>
            <Ionicons name="sparkles-outline" size={wp(16)} color="#C17C74" style={{ marginRight: wp(10) }} />
            <Text style={styles.promoText}>{t('new_drops')}</Text>
            <TouchableOpacity
              style={[styles.promoBtn, notifyEnabled && { backgroundColor: '#a0635d' }]}
              onPress={handleNotify}
              activeOpacity={0.85}
            >
              <Ionicons name={notifyEnabled ? 'notifications' : 'notifications-outline'} size={wp(13)} color="white" style={{ marginRight: wp(4) }} />
              <Text style={styles.promoBtnText}>{notifyEnabled ? t('notifying') : t('notify_me_btn')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: hp(32) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo: { width: wp(120), height: hp(50) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(20), marginBottom: hp(14) },
  headerTitle: { fontSize: fp(20), fontWeight: '700', color: '#C17C74' },
  headerSub: { fontSize: fp(13), color: '#888888' },
  headerActions: { flexDirection: 'row', gap: wp(8), alignItems: 'center' },
  iconBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  badgeCount: { position: 'absolute', top: hp(4), right: wp(4), width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: '#E05C5C', alignItems: 'center', justifyContent: 'center' },
  badgeCountText: { fontSize: fp(9), fontWeight: '800', color: 'white' },
  searchBarWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', borderRadius: wp(12), paddingHorizontal: wp(12), height: hp(40), marginHorizontal: wp(16), marginBottom: hp(10), borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)' },
  searchInput: { flex: 1, fontSize: fp(14), color: '#2c2c2c' },
  scrollContent: { paddingBottom: hp(32) },
  chipsRow: { paddingHorizontal: wp(14), paddingTop: hp(12), paddingBottom: hp(12), gap: wp(8), flexDirection: 'row' },
  chip: { paddingHorizontal: wp(16), paddingVertical: hp(7), borderRadius: wp(20), borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)', backgroundColor: '#F2E6E3' },
  chipActive: { backgroundColor: '#C17C74' },
  chipText: { fontSize: fp(12), color: '#C17C74', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(14), gap: wp(10) },
  gridItem: { width: CARD_WIDTH },
  wCard: { backgroundColor: '#F2E6E3', borderRadius: wp(18), overflow: 'hidden' },
  wCardImg: { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  fashBadge: { position: 'absolute', bottom: hp(8), left: wp(8), backgroundColor: '#C17C74', borderRadius: wp(6), paddingHorizontal: wp(7), paddingVertical: hp(3) },
  fashBadgeText: { color: '#fff', fontSize: fp(8), fontWeight: '800', letterSpacing: 0.4 },
  wCardBadge: { position: 'absolute', top: hp(10), left: wp(10), backgroundColor: '#C17C74', borderRadius: wp(8), paddingHorizontal: wp(7), paddingVertical: hp(3) },
  wCardBadgeText: { color: '#fff', fontSize: fp(9), fontWeight: '700' },
  heartBtn: { position: 'absolute', top: hp(10), right: wp(10), width: wp(32), height: wp(32), borderRadius: wp(16), backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(193,124,116,0.25)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  wCardInfo: { padding: wp(10) },
  wCardBrand: { fontSize: fp(9), fontWeight: '700', color: '#C17C74', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: hp(2) },
  wCardName: { fontSize: fp(12), fontWeight: '600', color: '#2c2c2c' },
  wCardDetail: { fontSize: fp(10), color: '#888888', marginTop: hp(2) },
  wCardBottom: { flexDirection: 'row', alignItems: 'baseline', gap: wp(3), marginTop: hp(4) },
  wCardPrice: { fontSize: fp(14), fontWeight: '800', color: '#C17C74' },
  perDay: { fontSize: fp(10), color: '#888', fontWeight: '500' },
  rentBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: hp(8), borderRadius: wp(10), paddingVertical: hp(7), backgroundColor: '#C17C74' },
  rentBtnText: { fontSize: fp(11), fontWeight: '700', color: 'white' },
  emptyState: { alignItems: 'center', paddingTop: hp(60), paddingHorizontal: wp(40), gap: hp(10) },
  emptyTitle: { fontSize: fp(17), fontWeight: '600', color: '#2c2c2c' },
  emptySub: { fontSize: fp(13), color: '#888888', textAlign: 'center', lineHeight: hp(20) },
  promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', marginHorizontal: wp(14), marginTop: hp(20), borderRadius: wp(14), padding: wp(14) },
  promoText: { flex: 1, fontSize: fp(13), fontWeight: '600', color: '#2c2c2c' },
  promoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C17C74', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: hp(8) },
  promoBtnText: { fontSize: fp(12), fontWeight: '700', color: '#fff' },
});