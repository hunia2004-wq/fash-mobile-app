import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getWardrobeItems, getWardrobeStats, deleteWardrobeItem } from '../../services/authService';
import { wp, hp, fp, SCREEN } from '../../utils/responsive';

const CARD_WIDTH = (SCREEN.width - wp(44)) / 2;
const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories'];

const WardrobeCard = ({ item, onDelete }) => {
  const isDonated = item.donated || item.isDonated;
  return (
    <TouchableOpacity style={[styles.wCard, isDonated && styles.wCardDonated]} activeOpacity={0.85}>
      <View style={styles.wCardImg}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: isDonated ? 0.45 : 1 }} />
        ) : (
          <MaterialCommunityIcons name="hanger" size={wp(48)} color={isDonated ? '#bbb' : '#C17C74'} />
        )}
        {isDonated ? (
          <View style={styles.donatedBadge}>
            <Ionicons name="heart" size={wp(9)} color="white" />
            <Text style={styles.donatedBadgeText}>Donated</Text>
          </View>
        ) : item.isFavorite ? (
          <View style={styles.wCardBadge}>
            <Text style={styles.wCardBadgeText}>Fav</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item._id)} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="trash-outline" size={wp(14)} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.wCardInfo}>
        <Text style={[styles.wCardName, isDonated && { color: '#aaa' }]}>{item.name}</Text>
        <Text style={styles.wCardDetail}>{[item.brand, item.size].filter(Boolean).join(' · ')}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function WardrobeScreen({ navigation }) {
  const { getToken } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWardrobe = useCallback(async (category = 'All', search = '') => {
    try {
      setLoading(true); setError(null);
      const token = await getToken();
      if (!token) return;
      const [itemsData, statsData] = await Promise.all([
        getWardrobeItems(token, category, search),
        getWardrobeStats(token),
      ]);
      setItems(itemsData.items ?? itemsData ?? []);
      setStats(statsData.stats ?? statsData ?? { total: 0 });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [getToken]);

  useFocusEffect(useCallback(() => { fetchWardrobe(activeCategory); }, [activeCategory]));

  useEffect(() => {
    if (!searchQuery) return;
    const delay = setTimeout(() => fetchWardrobe(activeCategory, searchQuery), 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleCategoryChange = (cat) => { setActiveCategory(cat); fetchWardrobe(cat); };

  const handleDelete = (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to remove this item from your wardrobe?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = await getToken();
          await deleteWardrobeItem(token, id);
          setItems(prev => prev.filter(item => item._id !== id));
          setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.logoHeader}>
        <Image source={require('./images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <Text style={styles.headerSub}>{stats.total} items</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBarWrap}>
          <Ionicons name="search-outline" size={wp(16)} color="#C17C74" style={{ marginRight: wp(8) }} />
          <TextInput style={styles.searchInput} placeholder="Search wardrobe..." placeholderTextColor="#888" value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={wp(16)} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsBar}>
          {[[String(stats.total), 'Items']].map(([num, lbl]) => (
            <View key={lbl} style={styles.statBox}>
              <Text style={styles.statNum}>{num}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[styles.chip, activeCategory === cat && styles.chipActive]} onPress={() => handleCategoryChange(cat)} activeOpacity={0.8}>
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color="#C17C74" style={{ marginTop: hp(40) }} />
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wifi-off" size={wp(40)} color="#C17C74" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchWardrobe(activeCategory)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hanger" size={wp(48)} color="#C17C74" />
            <Text style={styles.emptyText}>No items yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {items.map(item => (
              <View key={item._id} style={styles.gridItem}>
                <WardrobeCard item={item} onDelete={handleDelete} />
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.btnAccent} activeOpacity={0.85} onPress={() => navigation.navigate('UploadTab')}>
          <Feather name="plus" size={wp(16)} color="white" style={{ marginRight: wp(6) }} />
          <Text style={styles.btnAccentText}>Add Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader: { paddingBottom: hp(10), alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo: { width: wp(120), height: hp(50) },
  titleHeader: { backgroundColor: '#F5F5F5', paddingHorizontal: wp(20), marginBottom: hp(12) },
  headerTitle: { fontSize: fp(20), fontWeight: '700', color: '#C17C74' },
  headerSub: { fontSize: fp(13), color: '#888888', marginTop: hp(2) },
  scrollContent: { paddingBottom: hp(20) },
  statsBar: { flexDirection: 'row', gap: wp(10), paddingHorizontal: wp(14), paddingTop: hp(10), paddingBottom: hp(4) },
  statBox: { flex: 1, backgroundColor: '#F2E6E3', borderRadius: wp(14), paddingVertical: hp(12), alignItems: 'center' },
  statNum: { fontSize: fp(20), fontWeight: '700', color: '#C17C74' },
  statLbl: { fontSize: fp(11), color: '#888888', marginTop: hp(2) },
  searchBarWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2E6E3', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: hp(10), marginHorizontal: wp(14), marginBottom: hp(8), borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)' },
  searchInput: { flex: 1, fontSize: fp(14), color: '#2c2c2c' },
  chipsRow: { paddingHorizontal: wp(14), paddingBottom: hp(12), gap: wp(8), flexDirection: 'row' },
  chip: { paddingHorizontal: wp(16), paddingVertical: hp(7), borderRadius: wp(20), borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)', backgroundColor: '#F2E6E3' },
  chipActive: { backgroundColor: '#C17C74' },
  chipText: { fontSize: fp(12), color: '#2c2c2c', fontWeight: '600' },
  chipTextActive: { color: 'white' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(14), gap: wp(10) },
  gridItem: { width: CARD_WIDTH },
  wCard: { backgroundColor: '#F2E6E3', borderRadius: wp(18), overflow: 'hidden' },
  wCardImg: { width: '100%', aspectRatio: 3 / 4, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  wCardBadge: { position: 'absolute', top: hp(10), right: wp(10), backgroundColor: '#C17C74', borderRadius: wp(8), paddingHorizontal: wp(7), paddingVertical: hp(3) },
  wCardBadgeText: { color: 'white', fontSize: fp(9), fontWeight: '700' },
  deleteBtn: { position: 'absolute', top: hp(8), left: wp(8), width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: '#C17C74', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  wCardInfo: { padding: wp(10) },
  wCardName: { fontSize: fp(12), fontWeight: '600', color: '#2c2c2c' },
  wCardDetail: { fontSize: fp(10), color: '#888888', marginTop: hp(2) },
  btnAccent: { flexDirection: 'row', backgroundColor: '#C17C74', marginHorizontal: wp(14), marginTop: hp(18), borderRadius: wp(16), paddingVertical: hp(15), alignItems: 'center', justifyContent: 'center' },
  btnAccentText: { color: 'white', fontSize: fp(15), fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: hp(60), gap: hp(10) },
  emptyText: { color: '#888', fontSize: fp(14), textAlign: 'center', paddingHorizontal: wp(20) },
  retryBtn: { marginTop: hp(6), paddingHorizontal: wp(20), paddingVertical: hp(8), backgroundColor: '#C17C74', borderRadius: wp(12) },
  retryText: { color: 'white', fontSize: fp(13), fontWeight: '600' },
  wCardDonated: { backgroundColor: '#f0eded', borderWidth: 1, borderColor: 'rgba(193,124,116,0.12)' },
  donatedBadge: { position: 'absolute', top: hp(10), right: wp(10), flexDirection: 'row', alignItems: 'center', gap: wp(3), backgroundColor: '#C17C74', borderRadius: wp(8), paddingHorizontal: wp(7), paddingVertical: hp(3) },
  donatedBadgeText: { color: 'white', fontSize: fp(9), fontWeight: '700' },
});