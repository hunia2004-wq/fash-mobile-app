import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './Packingdata';

const { width } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗', Shoes: '👟',
  Bags: '👜', Accessories: '✨', Outerwear: '🧥',
};

export default function OutfitDetailScreen({ navigation, route }) {
  const { outfit, collection } = route.params;

  // items come fully populated from the backend — no static lookup needed
  const items = outfit.items ?? [];

  const handleStyleWithAI = () => {
    const itemNames = items.map((i) => i.name).join(', ');
    const message = `I'm wearing this outfit: ${itemNames}. The occasion is ${outfit.occasion || 'casual'}. Can you give me styling tips and suggest what accessories to add?`;
    navigation.navigate('AIStylingScreen', { prefillMessage: message });
  };

  const categoryColors = {
    Tops: '#e3f2fd',
    Bottoms: '#f3e5f5',
    Dresses: '#fce4ec',
    Shoes: '#e8f5e9',
    Bags: '#fff8e1',
    Accessories: '#fff3e0',
    Outerwear: '#e0f2f1',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{outfit.name}</Text>
  
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero — uses collection if passed, gracefully falls back */}
        {collection && (
          <View style={[styles.hero, { backgroundColor: collection.color ?? COLORS.accentLight }]}>
            <Text style={styles.heroEmoji}>{collection.emoji ?? '👗'}</Text>
            <View style={styles.heroItemsRow}>
              {items.map((item, i) => (
                <View key={item._id ?? i} style={[styles.heroItemBubble, { marginLeft: i > 0 ? -8 : 0 }]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="cover" />
                  ) : (
                    <Text style={styles.heroItemEmoji}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.heroCollection}>{collection.name}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.outfitTitle}>{outfit.name}</Text>
          <View style={styles.tagRow}>
            {outfit.occasion && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{outfit.occasion}</Text>
              </View>
            )}
            {outfit.season && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{outfit.season}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Outfit Items · {items.length} pieces</Text>
          {items.map((item, i) => (
            <View
              key={item._id ?? i}
              style={[styles.itemRow, { backgroundColor: categoryColors[item.category] || COLORS.card }]}
            >
              <View style={styles.itemEmojiWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: 44, height: 44, borderRadius: 22 }} resizeMode="cover" />
                ) : (
                  <Text style={styles.itemEmoji}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {[item.brand, item.color, item.size].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Styling tip — only shown if outfit has one */}
        {outfit.tip && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Stylist Tip</Text>
              <View style={styles.tipCard}>
                <Ionicons name="sparkles" size={18} color={COLORS.accent} style={{ marginTop: 1 }} />
                <Text style={styles.tipText}>{outfit.tip}</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* AI section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Want more ideas?</Text>
          <TouchableOpacity style={styles.aiCard} onPress={handleStyleWithAI} activeOpacity={0.88}>
            <View style={styles.aiCardIcon}>
              <MaterialCommunityIcons name="hanger" size={22} color={COLORS.white} />
            </View>
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>Ask AI Stylist</Text>
              <Text style={styles.aiCardSub}>Get personalised tips for this outfit</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity style={styles.wearBtn} onPress={() => Alert.alert('Outfit saved!', 'This outfit has been added to your diary.')} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.wearBtnText}>Wearing Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.aiBtn} onPress={handleStyleWithAI} activeOpacity={0.85}>
          <MaterialCommunityIcons name="magic-staff" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.aiBtnText}>Style with AI</Text>
        </TouchableOpacity>
      </View>
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

  scrollContent: { paddingBottom: 20 },

  hero: {
    alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, gap: 12,
  },
  heroEmoji: { fontSize: 44 },
  heroItemsRow: { flexDirection: 'row', alignItems: 'center' },
  heroItemBubble: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  heroItemEmoji: { fontSize: 24 },
  heroCollection: { fontSize: 13, fontWeight: '600', color: COLORS.muted },

  section: { paddingHorizontal: 20, paddingVertical: 18 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 },

  outfitTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: COLORS.accentLight, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 14,
  },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  itemEmojiWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center',
  },
  itemEmoji: { fontSize: 22 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  itemMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  categoryTag: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  categoryTagText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },

  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 16,
  },
  tipText: { flex: 1, fontSize: 14, color: COLORS.accent, lineHeight: 21, fontStyle: 'italic' },

  aiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  aiCardIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  aiCardText: { flex: 1 },
  aiCardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  aiCardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  wearBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 14,
  },
  wearBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.accent },
  aiBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14,
  },
  aiBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});