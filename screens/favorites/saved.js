import React, { useState } from 'react';
import {View, Text, ScrollView,StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

// const COLORS = {
//   bg: '#F5F5F5',
//   card: '#F2E6E3',
//   accent: '#C17C74',
//   text: '#2c2c2c',
//   muted: '#888888',
//   white: '#ffffff',
//   border: 'rgba(193,124,116,0.18)',
//   c2cBg: '#e0ede8',
//   c2cText: '#3a7a5e',
//   outfitBg: '#e8daf8',
//   outfitText: '#6b3fa0',
// };

const TABS = ['All', 'FASH', 'Marketplace'];

const ALL_ITEMS = [
  { id: '1',  name: 'White Abaya',             brand: 'FASH Originals',            price: '$250', image: require('./images/whiteabaya.png'), source: 'fash' },
  { id: '2',  name: 'Chanel Flap Bag',         brand: '@summer_closet · C2C',      price: '$489', image: require('./images/bluebag.png'),   source: 'c2c'  },
  { id: '3',  name: 'Burgundy Soirée Dress',   brand: 'FASH Exclusive',            price: '$380', image: require('./images/reddress.png'),   source: 'fash' },
  { id: '4',  name: 'YSL Libre Perfume',       brand: '@luxe_preloved · C2C',      price: '500',  image: require('./images/perfume.png'),       source: 'c2c'  },
  { id: '5',  name: 'TinkerBell Kids Costume', brand: 'FASH Originals',            price: '$150',  image: require('./images/tinkerbell.png'),          source: 'fash' },
  { id: '6',  name: 'Pink CarSeat',      brand: '@style_vault · C2C',        price: '$1580',  image: require('./images/carseat.png'),      source: 'c2c'  },
];


const SourceBadge = ({ source }) => {
  if (source === 'fash') {
    return (
      <View style={[styles.badge, { backgroundColor: '#C17C74' }]}>
        <Text style={[styles.badgeText, { color: 'white' }]}>FASH</Text>
      </View>
    );
  }

  if (source === 'c2c') {
    return (
      <View style={[styles.badge, { backgroundColor: '#e0ede8' }]}>
        <Text style={[styles.badgeText, { color: '#3a7a5e' }]}>Marketplace</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: '#e8daf8' }]}>
      <Text style={[styles.badgeText, { color: '#6b3fa0' }]}>AI Outfit</Text>
    </View>
  );
};

const SavedCard = ({ item }) => (
  <TouchableOpacity style={styles.itemCard} activeOpacity={0.85}>
    <View style={styles.itemImg}>
  {item.image ? (
    <Image
      source={item.image}
      style={styles.itemImage}
      resizeMode="cover"
    />
  ) : (
    <MaterialCommunityIcons
      name={item.icon}
      size={32}
      color="#C17C74"
    />
  )}
</View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemBrand}>{item.brand}</Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <SourceBadge source={item.source} />
    </View>

    <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7}>
      <Ionicons name="heart" size={20} color='#C17C74' />
    </TouchableOpacity>
  </TouchableOpacity>
);


export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = () => {
    if (activeTab === 'FASH')        return ALL_ITEMS.filter(i => i.source === 'fash');
    if (activeTab === 'Marketplace') return ALL_ITEMS.filter(i => i.source === 'c2c');
    return ALL_ITEMS;
  };

  const totalCount = {
    'All': ALL_ITEMS.length,
    'FASH': ALL_ITEMS.filter(i => i.source === 'fash').length,
    'Marketplace': ALL_ITEMS.filter(i => i.source === 'c2c').length,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor='white'/>

      {/* logo */}
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

        {/* Items section */}
        {filteredItems().length > 0 && (
  <>
    <Text style={styles.sectionLabel}>Saved Items</Text>
    {filteredItems().map(item => (
      <SavedCard key={item.id} item={item} />
    ))}
  </>
)}

        {/* Empty state */}
        {filteredItems().length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={52} color='#F2E6E3' />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptySub}>
              Browse the marketplace and tap{' '}
              <Ionicons name="heart-outline" size={13} color='#888888' />{' '}
              to save items here.
            </Text>
          </View>
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

  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
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

});