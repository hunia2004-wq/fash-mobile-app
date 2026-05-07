import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, ITEM_CATEGORIES } from './Packingdata';
import { useAuth } from '../../context/AuthContext';
import { getBuilderItems, createOutfit } from '../../services/authService';

const { width } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗', Shoes: '👟',
  Bags: '👜', Accessories: '✨', Outerwear: '🧥',
  'Soirée': '✨', 'Umrah & Hajj': '🕌', Kids: '👶', Suits: '👔',
};

const OCCASIONS = ['Casual', 'Work', 'Evening', 'Sport', 'Formal'];
const SEASONS   = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-season'];

export default function OutfitBuilderScreen({ navigation }) {
  const { getToken } = useAuth();

  const [items,          setItems]          = useState([]);
  const [selectedItems,  setSelectedItems]  = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [outfitName,     setOutfitName]     = useState('');
  const [occasion,       setOccasion]       = useState('');
  const [season,         setSeason]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);

  // ── fetch builder items ──────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken();
        const data = await getBuilderItems(token, { category: activeCategory });
        setItems(data.items ?? data ?? []);
      } catch (err) {
        console.error('Failed to fetch builder items:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeCategory]);

  const filteredItems = items;

  // ── toggle selection ─────────────────────────────────────────────
  const toggleItem = (item) => {
    const id = item.itemId.toString();
    const isSelected = selectedItems.find(i => i.itemId.toString() === id);
    if (isSelected) {
      setSelectedItems(prev => prev.filter(i => i.itemId.toString() !== id));
    } else {
      const sameCategory = selectedItems.find(
        i => i.category === item.category && item.category !== 'Accessories'
      );
      if (sameCategory) {
        setSelectedItems(prev => [
          ...prev.filter(i => i.itemId.toString() !== sameCategory.itemId.toString()),
          item,
        ]);
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
    }
  };

  const isSelected = (id) => !!selectedItems.find(i => i.itemId.toString() === id.toString());

  // ── send to AI ───────────────────────────────────────────────────
  const handleSendToAI = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please pick at least one item first.');
      return;
    }
    const itemNames = selectedItems.map(i => i.name).join(', ');
    const message = `I've put together this outfit: ${itemNames}. Can you tell me how it looks and suggest any improvements or accessories?`;
    navigation.navigate('AIStylingScreen', { prefillMessage: message });
  };

  // ── save outfit ──────────────────────────────────────────────────
  const handleSaveOutfit = async () => {
    if (selectedItems.length < 2) {
      Alert.alert('Add more items', 'Pick at least 2 items to save an outfit.');
      return;
    }
    if (!outfitName.trim()) {
      Alert.alert('Name required', 'Please give your outfit a name.');
      return;
    }
    try {
      setSaving(true);
      const token = await getToken();
      await createOutfit(token, {
        name: outfitName.trim(),
        items: selectedItems.map(i => ({ itemId: i.itemId, source: i.source })),
        occasion: occasion || undefined,
        season: season || undefined,
      });
      Alert.alert('Outfit Saved! 🎉', 'Your outfit has been added to your collection.', [
        { text: 'OK', onPress: () => { setSelectedItems([]); setOutfitName(''); navigation.goBack(); } },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const categoryGroups = [
    'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Outerwear', 'Bags', 'Accessories',
  ].map(label => ({
    label,
    items: selectedItems.filter(i => i.category === label),
  })).filter(g => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Build Outfit</Text>
        <TouchableOpacity
          style={[styles.navSaveBtn, (selectedItems.length < 2 || saving) && { opacity: 0.4 }]}
          onPress={handleSaveOutfit}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.navSaveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Outfit name input */}
      {selectedItems.length >= 2 && (
        <View style={styles.nameInputWrap}>
          <TextInput
            style={styles.nameInput}
            placeholder="Name your outfit..."
            placeholderTextColor={COLORS.muted}
            value={outfitName}
            onChangeText={setOutfitName}
          />
        </View>
      )}

      {/* Preview bar */}
      <View style={styles.previewBar}>
        {selectedItems.length === 0 ? (
          <Text style={styles.previewEmpty}>Tap items below to build your outfit</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewRow}>
            {selectedItems.map(item => (
              <TouchableOpacity
                key={item.itemId.toString()}
                style={styles.previewItem}
                onPress={() => toggleItem(item)}
                activeOpacity={0.8}
              >
                <View style={styles.previewEmojiBubble}>
                  <Text style={styles.previewEmoji}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
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

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {ITEM_CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.8}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Outfit structure */}
        {selectedItems.length > 0 && (
          <View style={styles.structureCard}>
            <Text style={styles.structureTitle}>Your Outfit</Text>
            {categoryGroups.map(group => (
              <View key={group.label} style={styles.structureGroup}>
                <Text style={styles.structureGroupLabel}>{group.label}</Text>
                {group.items.map(item => (
                  <Text key={item.itemId.toString()} style={styles.structureGroupItem}>· {item.name}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {activeCategory === 'All' ? 'All Items' : activeCategory} · {filteredItems.length}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Add items to your wardrobe to start building outfits.</Text>
          </View>
        ) : (
          <View style={styles.itemsGrid}>
            {filteredItems.map(item => {
              const id = item.itemId.toString();
              const selected = isSelected(item.itemId);
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.itemCard, selected && styles.itemCardSelected]}
                  onPress={() => toggleItem(item)}
                  activeOpacity={0.85}
                >
                  {selected && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark" size={12} color={COLORS.white} />
                    </View>
                  )}
                  {/* Source badge */}
                  <View style={[styles.sourceBadge, item.source === 'collection' && styles.sourceBadgeFash]}>
                    <Text style={styles.sourceBadgeText}>{item.source === 'collection' ? 'FASH' : 'Mine'}</Text>
                  </View>
                  {item.image ? (
                    <View style={styles.itemEmojiBox}>
                      <Text style={styles.itemEmoji}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
                    </View>
                  ) : (
                    <View style={[styles.itemEmojiBox, selected && styles.itemEmojiBoxSelected]}>
                      <Text style={styles.itemEmoji}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
                    </View>
                  )}
                  <Text style={[styles.itemName, selected && styles.itemNameSelected]} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                  <Text style={[styles.itemCategory, selected && { color: COLORS.accent }]}>{item.category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  safe:                { flex: 1, backgroundColor: COLORS.bg },
  topNav:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn:              { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle:            { fontSize: 16, fontWeight: '700', color: '#C17C74' },
  navSaveBtn:          { backgroundColor: COLORS.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  navSaveBtnText:      { fontSize: 13, fontWeight: '700', color: COLORS.white },
  nameInputWrap:       { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  nameInput:           { backgroundColor: COLORS.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  previewBar:          { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 12, minHeight: 80, justifyContent: 'center' },
  previewEmpty:        { textAlign: 'center', fontSize: 13, color: COLORS.muted, paddingHorizontal: 20 },
  previewRow:          { paddingHorizontal: 16, gap: 12, alignItems: 'center' },
  previewItem:         { alignItems: 'center', width: 52 },
  previewEmojiBubble:  { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.accent },
  previewEmoji:        { fontSize: 22 },
  previewRemove:       { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  previewItemName:     { fontSize: 9, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  previewAIBtn:        { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 4, marginLeft: 4 },
  previewAIText:       { fontSize: 10, fontWeight: '700', color: COLORS.white },
  categoryRow:         { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', height: 52 },
  categoryPill:        { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, alignSelf: 'center' },
  categoryPillActive:  { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  categoryText:        { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  categoryTextActive:  { color: COLORS.white },
  scrollContent:       { paddingHorizontal: 16, paddingBottom: 100 },
  structureCard:       { backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 14, marginBottom: 16, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  structureTitle:      { fontSize: 12, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  structureGroup:      { marginBottom: 6 },
  structureGroupLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  structureGroupItem:  { fontSize: 12, color: COLORS.muted, marginLeft: 8, marginTop: 2 },
  sectionLabel:        { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12, marginTop: 4 },
  emptyState:          { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyTitle:          { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptySub:            { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  itemsGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard:            { width: (width - 52) / 3, backgroundColor: COLORS.white, borderRadius: 14, padding: 10, alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: COLORS.border },
  itemCardSelected:    { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  selectedCheck:       { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  sourceBadge:         { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.card, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  sourceBadgeFash:     { backgroundColor: COLORS.accentLight },
  sourceBadgeText:     { fontSize: 8, fontWeight: '700', color: COLORS.accent },
  itemEmojiBox:        { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  itemEmojiBoxSelected:{ backgroundColor: COLORS.white },
  itemEmoji:           { fontSize: 24 },
  itemName:            { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 15 },
  itemNameSelected:    { color: COLORS.accent },
  itemBrand:           { fontSize: 9, color: COLORS.muted },
  itemCategory:        { fontSize: 9, color: COLORS.muted, fontWeight: '600' },
  ctaBar:              { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  clearBtn:            { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border },
  clearBtnText:        { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  aiBtn:               { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14 },
  aiBtnText:           { fontSize: 13, fontWeight: '700', color: COLORS.white },
});