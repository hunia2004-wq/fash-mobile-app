import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, WARDROBE_ITEMS, ITEM_CATEGORIES } from './Packingdata';

const { width } = Dimensions.get('window');

export default function OutfitBuilderScreen({ navigation }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [outfitName, setOutfitName] = useState('');

  const filteredItems = WARDROBE_ITEMS.filter((item) =>
    activeCategory === 'All' || item.category === activeCategory
  );

  const toggleItem = (item) => {
    const isSelected = selectedItems.find((i) => i.id === item.id);
    if (isSelected) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      // Only one item per category (except accessories)
      const sameCategory = selectedItems.find(
        (i) => i.category === item.category && item.category !== 'Accessories'
      );
      if (sameCategory) {
        setSelectedItems((prev) => [...prev.filter((i) => i.id !== sameCategory.id), item]);
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    }
  };

  const isSelected = (id) => !!selectedItems.find((i) => i.id === id);

  const handleSendToAI = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please pick at least one item first.');
      return;
    }
    const itemNames = selectedItems.map((i) => i.name).join(', ');
    const message = `I've put together this outfit: ${itemNames}. Can you tell me how it looks and suggest any improvements or accessories?`;
    navigation.navigate('AIStylingScreen', { prefillMessage: message });
  };

  const handleSaveOutfit = () => {
    if (selectedItems.length < 2) {
      Alert.alert('Add more items', 'Pick at least 2 items to save an outfit.');
      return;
    }
    Alert.alert('Outfit Saved! 🎉', 'Your custom outfit has been added to your collection.');
    setSelectedItems([]);
  };

  const categoryGroups = [
    { label: 'Tops', items: selectedItems.filter((i) => i.category === 'Tops') },
    { label: 'Bottoms', items: selectedItems.filter((i) => i.category === 'Bottoms') },
    { label: 'Dresses', items: selectedItems.filter((i) => i.category === 'Dresses') },
    { label: 'Shoes', items: selectedItems.filter((i) => i.category === 'Shoes') },
    { label: 'Outerwear', items: selectedItems.filter((i) => i.category === 'Outerwear') },
    { label: 'Bags', items: selectedItems.filter((i) => i.category === 'Bags') },
    { label: 'Accessories', items: selectedItems.filter((i) => i.category === 'Accessories') },
  ].filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Build Outfit</Text>
        <TouchableOpacity
          style={[styles.navSaveBtn, selectedItems.length < 2 && { opacity: 0.4 }]}
          onPress={handleSaveOutfit}
          activeOpacity={0.8}
        >
          <Text style={styles.navSaveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewBar}>
        {selectedItems.length === 0 ? (
          <Text style={styles.previewEmpty}>Tap items below to build your outfit</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
            {selectedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.previewItem}
                onPress={() => toggleItem(item)}
                activeOpacity={0.8}
              >
                <View style={styles.previewEmojiBubble}>
                  <Text style={styles.previewEmoji}>{item.emoji}</Text>
                  <View style={styles.previewRemove}>
                    <Ionicons name="close" size={8} color={COLORS.white} />
                  </View>
                </View>
                <Text style={styles.previewItemName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}

            {selectedItems.length > 0 && (
              <TouchableOpacity style={styles.previewAIBtn} onPress={handleSendToAI} activeOpacity={0.8}>
                <MaterialCommunityIcons name="magic-staff" size={18} color={COLORS.white} />
                <Text style={styles.previewAIText}>Ask AI</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {ITEM_CATEGORIES.map((cat) => (
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

        {selectedItems.length > 0 && (
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Your Outfit</Text>
            {categoryGroups.map((group) => (
              <View key={group.label} style={styles.structureGroup}>
                <Text style={styles.structureGroupLabel}>{group.label}</Text>
                {group.items.map((item) => (
                  <Text key={item.id} style={styles.structureGroupItem}>· {item.name}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {activeCategory === 'All' ? 'All Items' : activeCategory} · {filteredItems.length}
        </Text>
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const selected = isSelected(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, selected && styles.itemCardSelected]}
                onPress={() => toggleItem(item)}
                activeOpacity={0.85}
              >
                {/* Selected check */}
                {selected && (
                  <View style={styles.selectedCheck}>
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  </View>
                )}

                <View style={[styles.itemEmojiBox, selected && styles.itemEmojiBoxSelected]}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>

                <Text style={[styles.itemName, selected && styles.itemNameSelected]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={[styles.itemCategory, selected && { color: COLORS.accent }]}>
                  {item.category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedItems.length > 0 && (
        <View style={styles.ctaBar}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedItems([])} activeOpacity={0.8}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aiBtn} onPress={handleSendToAI} activeOpacity={0.85}>
            <MaterialCommunityIcons name="magic-staff" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.aiBtnText}>Style with AI ({selectedItems.length} items)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  topNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  navSaveBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  navSaveBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },


  previewBar: {
    backgroundColor: COLORS.white, borderBottomWidth: 1,
    borderBottomColor: COLORS.border, paddingVertical: 12, minHeight: 80,
    justifyContent: 'center',
  },
  previewEmpty: { textAlign: 'center', fontSize: 13, color: COLORS.muted, paddingHorizontal: 20 },
  previewRow: { paddingHorizontal: 16, gap: 12, alignItems: 'center' },
  previewItem: { alignItems: 'center', width: 52 },
  previewEmojiBubble: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.accent,
  },
  previewEmoji: { fontSize: 22 },
  previewRemove: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  previewItemName: { fontSize: 9, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  previewAIBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 8, gap: 4, marginLeft: 4,
  },
  previewAIText: { fontSize: 10, fontWeight: '700', color: COLORS.white },

  
  categoryRow: {
    paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', height: 52,
  },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1,
    borderColor: COLORS.border, marginRight: 8, alignSelf: 'center',
  },
  categoryPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  categoryTextActive: { color: COLORS.white },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

  structureCard: {
    backgroundColor: COLORS.accentLight, borderRadius: 14,
    padding: 14, marginBottom: 16, marginTop: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  structureTitle: { fontSize: 12, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  structureGroup: { marginBottom: 6 },
  structureGroupLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  structureGroupItem: { fontSize: 12, color: COLORS.muted, marginLeft: 8, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.9,
    marginBottom: 12, marginTop: 4,
  },

 
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: {
    width: (width - 52) / 3,
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 10, alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  itemCardSelected: {
    borderColor: COLORS.accent, backgroundColor: COLORS.accentLight,
  },
  selectedCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  itemEmojiBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  itemEmojiBoxSelected: { backgroundColor: COLORS.white },
  itemEmoji: { fontSize: 24 },
  itemName: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 15 },
  itemNameSelected: { color: COLORS.accent },
  itemBrand: { fontSize: 9, color: COLORS.muted },
  itemCategory: { fontSize: 9, color: COLORS.muted, fontWeight: '600' },


  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  clearBtn: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
  },
  clearBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  aiBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14,
  },
  aiBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
});