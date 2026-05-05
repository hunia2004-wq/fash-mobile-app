import React, { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Image} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories'];

// const COLORS = {
//   bg: '#F5F5F5',
//   card: '#F2E6E3',
//   accent: '#C17C74',
//   accentDark: '#a5635b',
//   text: '#2c2c2c',
//   muted: '#888888',
//   white: '#ffffff',
//   border: 'rgba(193,124,116,0.18)',
// };

const WARDROBE_ITEMS = [
  { id: '1', name: 'Floral Midi Dress', detail: 'Zara · Size S',    image: require('./images/floralmididress.png'),  badge: 'New', category: 'Dresses'} ,
  { id: '2', name: 'Tan Leather Tote',  detail: 'Polene · own',     image: require('./images/tanleathertote.png'),   badge: null,  category: 'Bags'},
  { id: '3', name: 'White Sneakers',    detail: 'Adidas · Size 38', image: require('./images/whitesneakers.png'),    badge: null,  category: 'Shoes'},
  { id: '4', name: 'Beige Trench',      detail: 'Mango · Size M',   image: require('./images/beigetrench.png'),      badge: 'Fav', category: 'Tops'},
  { id: '5', name: 'High-Waist Jeans',  detail: "Levi's · W26",     image: require('./images/lightdenimpants.png'),  badge: null,  category: 'Bottoms'},
];

const WardrobeCard = ({ item }) => (
  <TouchableOpacity style={styles.wCard} activeOpacity={0.85}>
    <View style={styles.wCardImg}>
    {item.image ? (
  <Image 
    source={item.image} 
    style={{ width: '90%', height: '90%', resizeMode: 'cover' }}
  />
) : (
  <MaterialCommunityIcons name={item.icon} size={48} color='#C17C74' />
)}
      {item.badge && (
        <View style={styles.wCardBadge}>
          <Text style={styles.wCardBadgeText}>{item.badge}</Text>
        </View>
      )}

    </View>
    <View style={styles.wCardInfo}>
      <Text style={styles.wCardName}>{item.name}</Text>
      <Text style={styles.wCardDetail}>{item.detail}</Text>
    </View>
  </TouchableOpacity>
);

export default function WardrobeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
  ? WARDROBE_ITEMS
  : WARDROBE_ITEMS.filter(item => item.category === activeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor='white' />

      {/* logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('./images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        </View>

        {/* title */}
        <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <Text style={styles.headerSub}>5 items</Text>
      </View>

      <ScrollView 
  style={{ flex: 1 }} 
  showsVerticalScrollIndicator={false} 
  contentContainerStyle={styles.scrollContent}
>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[['5', 'Items']].map(([num, lbl]) => (
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
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid */}
        <View style={styles.grid}>
        {filteredItems.map(item => (
            <View key={item.id} style={styles.gridItem}>
              <WardrobeCard item={item} />
            </View>
          ))}
        </View>

        {/* Add button */}
        <TouchableOpacity style={styles.btnAccent} activeOpacity={0.85}>
          <Feather name="plus" size={16} color='white' style={{ marginRight: 6 }} />
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
  },
  
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#C17C74',
  },
  
  headerSub: { 
    fontSize: 13, 
    color: '#888888', 
    marginTop: 2 
  },

  scrollContent: { 
    paddingBottom: 20,
  },

  statsBar: { 
    flexDirection: 'row', 
    gap: 10, 
    padding: 14 
  },

  statBox: { 
    flex: 1, 
    backgroundColor: '#F2E6E3', 
    borderRadius: 14, 
    paddingVertical: 12, 
    alignItems: 'center' 
  },

  statNum: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#C17C74', 
  },

  statLbl: { 
    fontSize: 11, 
    color: '#888888', 
    marginTop: 2 
  },

  chipsRow: { 
    paddingHorizontal: 14, 
    paddingBottom: 12, 
    gap: 8, 
    flexDirection: 'row' 
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
    color: '#C17C74', 
    fontWeight: '500' 
  },

  chipTextActive: { 
    color: 'white'
  },

  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 14, 
    gap: 10 
  },

  gridItem: { 
    width: CARD_WIDTH 
  },

  wCard: { 
    backgroundColor: '#F2E6E3', 
    borderRadius: 18, 
    overflow: 'hidden' 
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
    fontWeight: '700' 
  },

  wCardInfo: { 
    padding: 10 
  },

  wCardName: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#2c2c2c',
  },

  wCardDetail: { 
    fontSize: 10, 
    color: '#888888', 
    marginTop: 2 
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
    fontWeight: '600' 
  },

});
