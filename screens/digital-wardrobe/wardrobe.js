import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getWardrobeItems, getWardrobeStats, toggleWardrobeFavorite, deleteWardrobeItem } from '../../services/authService';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories'];

const WardrobeCard = ({ item, onDelete }) => {
  const isDonated = item.donated || item.isDonated;
  return (
    <TouchableOpacity style={[styles.wCard, isDonated && styles.wCardDonated]} activeOpacity={0.85}>
      <View style={styles.wCardImg}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover', opacity: isDonated ? 0.45 : 1 }}
          />
        ) : (
          <MaterialCommunityIcons name="hanger" size={48} color={isDonated ? '#bbb' : '#C17C74'} />
        )}

        {/* Donated flag — replaces Fav badge when donated */}
        {isDonated ? (
          <View style={styles.donatedBadge}>
            <Ionicons name="heart" size={9} color="white" />
            <Text style={styles.donatedBadgeText}>Donated</Text>
          </View>
        ) : item.isFavorite ? (
          <View style={styles.wCardBadge}>
            <Text style={styles.wCardBadgeText}>Fav</Text>
          </View>
        ) : null}

        {/* Delete button — always shown */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item._id)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={14} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.wCardInfo}>
        <Text style={[styles.wCardName, isDonated && { color: '#aaa' }]}>{item.name}</Text>
        <Text style={styles.wCardDetail}>
          {[item.brand, item.size].filter(Boolean).join(' · ')}
        </Text>
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
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) return;
      const [itemsData, statsData] = await Promise.all([
        getWardrobeItems(token, category, search),
        getWardrobeStats(token),
      ]);
      setItems(itemsData.items ?? itemsData ?? []);
      setStats(statsData.stats ?? statsData ?? { total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Re-fetch whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWardrobe(activeCategory);
    }, [activeCategory])
  );

  // Debounced search
  useEffect(() => {
    if (!searchQuery) return;
    const delay = setTimeout(() => fetchWardrobe(activeCategory, searchQuery), 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    fetchWardrobe(cat);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your wardrobe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await deleteWardrobeItem(token, id);
              setItems(prev => prev.filter(item => item._id !== id));
              setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('./images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <Text style={styles.headerSub}>{stats.total} items</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchBarWrap}>
          <Ionicons name="search-outline" size={16} color="#C17C74" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wardrobe..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[
            [String(stats.total), 'Items'],
          ].map(([num, lbl]) => (
            <View key={lbl} style={styles.statBox}>
              <Text style={styles.statNum}>{num}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

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
              onPress={() => handleCategoryChange(cat)}
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
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wifi-off" size={40} color="#C17C74" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchWardrobe(activeCategory)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hanger" size={48} color="#C17C74" />
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

        {/* Add button */}
        <TouchableOpacity style={styles.btnAccent} activeOpacity={0.85} onPress={() => navigation.navigate('UploadTab')}>
          <Feather name="plus" size={16} color="white" style={{ marginRight: 6 }} />
          <Text style={styles.btnAccentText}>Add Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 44) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  logoHeader: {
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  logo: {
    width: 120,
    height: 50,
  },

  titleHeader: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C17C74',
  },

  headerSub: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  statsBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },

  statBox: {
    flex: 1,
    backgroundColor: '#F2E6E3',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  statNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C17C74',
  },

  statLbl: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },

  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2E6E3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginTop: 0,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(193,124,116,0.18)',
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2c2c2c',
  },

  chipsRow: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(193,124,116,0.18)',
    backgroundColor: '#F2E6E3',
  },

  chipActive: {
    backgroundColor: '#C17C74',
  },

  chipText: {
    fontSize: 12,
    color: '#2c2c2c',
    fontWeight: '600',
  },

  chipTextActive: {
    color: 'white',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 10,
  },

  gridItem: {
    width: CARD_WIDTH,
  },

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
  },

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
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },

  deleteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C17C74',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  wCardInfo: {
    padding: 10,
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

  btnAccent: {
    flexDirection: 'row',
    backgroundColor: '#C17C74',
    marginHorizontal: 14,
    marginTop: 18,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnAccentText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  retryBtn: { marginTop: 6, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#C17C74', borderRadius: 12 },
  retryText: { color: 'white', fontSize: 13, fontWeight: '600' },

  wCardDonated: {
    backgroundColor: '#f0eded',
    borderWidth: 1,
    borderColor: 'rgba(193,124,116,0.12)',
  },
  donatedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#C17C74',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  donatedBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  
});