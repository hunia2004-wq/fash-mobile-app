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
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentDark: '#a5635b',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
};

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Bags', 'Accessories'];

const WARDROBE_ITEMS = [
  { id: '1', name: 'Floral Midi Dress', detail: 'Zara · Size S',    icon: 'tshirt-crew',       badge: 'New' },
  { id: '2', name: 'Tan Leather Tote',  detail: 'FASH · own',       icon: 'bag-personal',      badge: null  },
  { id: '3', name: 'White Sneakers',    detail: 'Adidas · Size 38',  icon: 'shoe-sneaker',      badge: null  },
  { id: '4', name: 'Beige Trench',      detail: 'H&M · Size M',      icon: 'coat-rack',         badge: 'Fav' },
  { id: '5', name: 'High-Waist Jeans',  detail: "Levi's · W26",      icon: 'human-male',        badge: null  },
  { id: '6', name: 'Gold Hoops',        detail: 'FASH · own',        icon: 'ring',              badge: null  },
];

const WardrobeCard = ({ item }) => (
  <TouchableOpacity style={styles.wCard} activeOpacity={0.85}>
    <View style={styles.wCardImg}>
      <MaterialCommunityIcons name={item.icon} size={48} color={COLORS.accent} />
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <Text style={styles.headerSub}>42 items · 6 outfits saved</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[['42', 'Items'], ['6', 'Outfits'], ['4', 'Categories']].map(([num, lbl]) => (
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
          {WARDROBE_ITEMS.map(item => (
            <View key={item.id} style={styles.gridItem}>
              <WardrobeCard item={item} />
            </View>
          ))}
        </View>

        {/* Add button */}
        <TouchableOpacity style={styles.btnAccent} activeOpacity={0.85}>
          <Feather name="plus" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.btnAccentText}>Add Item</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 44) / 2;

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

  scrollContent: { paddingBottom: 40 },

  statsBar: { flexDirection: 'row', gap: 10, padding: 14 },
  statBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  statLbl: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  chipsRow: { paddingHorizontal: 14, paddingBottom: 12, gap: 8, flexDirection: 'row' },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.accent },
  chipText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  gridItem: { width: CARD_WIDTH },

  wCard: { backgroundColor: COLORS.card, borderRadius: 18, overflow: 'hidden' },
  wCardImg: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#e8d5d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wCardBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  wCardBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  wCardInfo: { padding: 10 },
  wCardName: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  wCardDetail: { fontSize: 10, color: COLORS.muted, marginTop: 2 },

  btnAccent: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    marginHorizontal: 14,
    marginTop: 18,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAccentText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});