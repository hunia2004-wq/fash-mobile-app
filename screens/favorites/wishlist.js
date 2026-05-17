import React, { useState, useCallback, useRef } from 'react';
import {View, Text, ScrollView,StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image, ActivityIndicator} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getSaved, removeSaved } from '../../services/authService';


const { width } = Dimensions.get('window');


const TABS = ['All', 'FASH', 'Marketplace'];


const SourceBadge = ({ itemType }) => {
  if (itemType === 'collection') {
    return (
      <View style={[styles.badge, { backgroundColor: '#C17C74' }]}>
        <Text style={[styles.badgeText, { color: 'white' }]}>FASH</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: '#e0ede8' }]}>
      <Text style={[styles.badgeText, { color: '#3a7a5e' }]}>Marketplace</Text>
    </View>
  );
};


const SavedCard = ({ savedItem, onRemove }) => {
  const { item, itemType, itemId } = savedItem;
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImg}>
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <MaterialCommunityIcons name="hanger" size={32} color="#C17C74" />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item?.title ?? '—'}</Text>
        <Text style={styles.itemBrand}>
          {itemType === 'marketplace' && item?.handle
            ? `${item.handle} · C2C`
            : item?.brand ?? '—'}
        </Text>
        <Text style={styles.itemPrice}>${item?.price ?? '—'}</Text>
        <SourceBadge itemType={itemType} />
      </View>
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => onRemove(itemId)}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={20} color="#C17C74" />
      </TouchableOpacity>
    </View>
  );
};


export default function SavedScreen() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

const fetchSaved = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) return;
    const data = await getSaved(token);
    setSavedItems(data.savedItems ?? data ?? []);
    hasFetched.current = true;
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [getToken]);

useFocusEffect(
  useCallback(() => {
    // Only refetch if not already fetched, or if coming back after a remove action
    if (!hasFetched.current) {
      fetchSaved();
    }
  }, [fetchSaved])
);

const handleRemove = async (itemId) => {
  try {
    const token = await getToken();
    await removeSaved(token, itemId);
    setSavedItems(prev => prev.filter(s => s.itemId.toString() !== itemId.toString()));
    hasFetched.current = true; // keep true, list is already updated locally
  } catch (err) {
    console.error('Remove failed:', err.message);
  }
};

  const filteredItems = () => {
    if (activeTab === 'FASH')        return savedItems.filter(i => i.itemType === 'collection');
    if (activeTab === 'Marketplace') return savedItems.filter(i => i.itemType === 'marketplace');
    return savedItems;
  };

  const totalCount = {
    'All':         savedItems.length,
    'FASH':        savedItems.filter(i => i.itemType === 'collection').length,
    'Marketplace': savedItems.filter(i => i.itemType === 'marketplace').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.logoHeader}>
        <Image
          source={require('../../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <Text style={styles.headerSub}>Your wishlist & favorites</Text>
      </View>

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
        {loading ? (
          <ActivityIndicator size="large" color="#C17C74" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="wifi-off" size={40} color="#C17C74" />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySub}>{error}</Text>
            <TouchableOpacity onPress={fetchSaved} style={styles.retryBtn}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredItems().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={52} color="#F2E6E3" />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>
              Browse the marketplace or FASH collection and tap{' '}
              <Ionicons name="heart-outline" size={13} color="#888888" />{' '}
              to save items here.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Saved Items</Text>
            {filteredItems().map(item => (
              <SavedCard key={item.savedId} savedItem={item} onRemove={handleRemove} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
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
    marginBottom: 10,
  },

  tabsWrapper: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F5F5F5',
  },

  tabsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 14 
  },

  tab: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 2, 
    borderBottomColor: 'transparent', 
    marginRight: 2 
  },

  tabActive: { 
    borderBottomColor: '#C17C74',
  },

  tabText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#888888',
  },

  tabTextActive: { 
    color: '#C17C74', 
  },

  tabCount: { 
    fontSize: 11, 
    fontWeight: '400' 
  },

  scrollContent: { 
    padding: 14, 
    paddingBottom: 50 
  },

  sectionLabel: {
    fontSize: 11, 
    fontWeight: '700', 
    color: '#C17C74',
    marginTop: 10, 
    marginBottom: 10,
    textTransform: 'uppercase', 
    letterSpacing: 0.9,
  },

  itemCard: {
    backgroundColor: '#F2E6E3',
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

  itemInfo: { 
    flex: 1, 
    gap: 3 
  },

  itemName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#2c2c2c',
  },

  itemBrand: { 
    fontSize: 11, 
    color: '#888888',
  },

  itemPrice: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#C17C74', 
  },

  badge: { 
    alignSelf: 'flex-start', 
    marginTop: 4, 
    paddingHorizontal: 9, 
    paddingVertical: 3, 
    borderRadius: 7 
  },

  badgeText: { 
    fontSize: 10, 
    fontWeight: '700' 
  },

  heartBtn: { 
    padding: 8 
  },

  emptyState: { 
    alignItems: 'center', 
    paddingTop: 80, 
    paddingHorizontal: 40, 
    gap: 12 
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
    lineHeight: 20 
  },

  retryBtn: { 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    backgroundColor: '#C17C74', 
    borderRadius: 12 
  },

  retryText: { 
    color: 'white', 
    fontSize: 13, 
    fontWeight: '600' 
  },

});
