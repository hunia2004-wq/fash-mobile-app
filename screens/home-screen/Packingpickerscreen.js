import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, COLLECTIONS, WARDROBE_ITEMS } from './Packingdata';

const { width } = Dimensions.get('window');


const OutfitCard = ({ outfit, collection, onPress, onSendToAI }) => {
  const items = outfit.items.map((id) => WARDROBE_ITEMS.find((w) => w.id === id)).filter(Boolean);

  return (
    <TouchableOpacity style={styles.outfitCard} onPress={onPress} activeOpacity={0.88}>
      {/* Items preview */}
      <View style={styles.outfitItemsPreview}>
        {items.slice(0, 3).map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.itemEmojiBox,
              { marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i },
            ]}
          >
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
          </View>
        ))}
        {items.length > 3 && (
          <View style={[styles.itemEmojiBox, styles.itemEmojiMore, { marginLeft: -10 }]}>
            <Text style={styles.itemEmojiMoreText}>+{items.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.outfitCardInfo}>
        <Text style={styles.outfitCardName}>{outfit.name}</Text>
        <Text style={styles.outfitCardOccasion}>{outfit.occasion} · {outfit.vibe}</Text>
        <Text style={styles.outfitCardItems} numberOfLines={1}>
          {items.map((i) => i.name).join(', ')}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.outfitCardActions}>
        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => onSendToAI(outfit)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="magic-staff" size={13} color={COLORS.accent} />
          <Text style={styles.aiBtnText}>Style with AI</Text>
        </TouchableOpacity>
        <Feather name="chevron-right" size={16} color={COLORS.muted} />
      </View>
    </TouchableOpacity>
  );
};

const CollectionCard = ({ collection, onViewAll, onSendToAI, navigation }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.collectionCard, { borderLeftColor: collection.accentColor, borderLeftWidth: 3 }]}>
      {/* Collection header */}
      <TouchableOpacity
        style={styles.collectionHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.85}
      >
        <View style={[styles.collectionEmojiBg, { backgroundColor: collection.color }]}>
          <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
        </View>
        <View style={styles.collectionMeta}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <Text style={styles.collectionDesc}>{collection.description}</Text>
          <Text style={styles.collectionCount}>{collection.outfits.length} outfits</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.collectionOutfits}>
          {collection.outfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              collection={collection}
              onPress={() => navigation.navigate('OutfitDetail', { outfit, collection })}
              onSendToAI={onSendToAI}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function OutfitPickerScreen({ navigation }) {
  const totalOutfits = COLLECTIONS.reduce((sum, c) => sum + c.outfits.length, 0);

  const handleSendToAI = (outfit) => {
    const items = outfit.items
      .map((id) => WARDROBE_ITEMS.find((w) => w.id === id)?.name)
      .filter(Boolean);
    const message = `Can you help me style this outfit: ${items.join(', ')}? The occasion is ${outfit.occasion}.`;
    navigation.navigate('AIStylist', { prefillMessage: message });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

 
      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Outfit Picker</Text>
          <Text style={styles.headerSub}>{totalOutfits} outfits · {COLLECTIONS.length} collections</Text>
        </View>
        <TouchableOpacity
          style={styles.buildBtn}
          onPress={() => navigation.navigate('OutfitBuilder')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.buildBtnText}>Build</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

    
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('AIStylist', {})}
          activeOpacity={0.88}
        >
          <View style={styles.aiBannerIcon}>
            <MaterialCommunityIcons name="hanger" size={22} color={COLORS.white} />
          </View>
          <View style={styles.aiBannerText}>
            <Text style={styles.aiBannerTitle}>AI Stylist</Text>
            <Text style={styles.aiBannerSub}>Get outfit suggestions from your wardrobe</Text>
          </View>
          <Ionicons name="sparkles" size={18} color={COLORS.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.builderCta}
          onPress={() => navigation.navigate('OutfitBuilder')}
          activeOpacity={0.88}
        >
          <View style={styles.builderCtaLeft}>
            <Ionicons name="color-wand-outline" size={20} color={COLORS.accent} />
            <View>
              <Text style={styles.builderCtaTitle}>Build a Custom Outfit</Text>
              <Text style={styles.builderCtaSub}>Pick items from your wardrobe</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.accent} />
        </TouchableOpacity>

        {/* Collections */}
        <Text style={styles.sectionLabel}>Collections</Text>
        {COLLECTIONS.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            navigation={navigation}
            onSendToAI={handleSendToAI}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: 120, height: 50 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  buildBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  buildBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 48 },

  aiBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  aiBannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  aiBannerText: { flex: 1 },
  aiBannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  aiBannerSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  // ── Builder CTA ──
  builderCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, marginBottom: 20,
    borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  builderCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  builderCtaTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  builderCtaSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.9,
  },

  // ── Collection Card ──
  collectionCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginBottom: 12, overflow: 'hidden',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  collectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  collectionEmojiBg: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  collectionEmoji: { fontSize: 26 },
  collectionMeta: { flex: 1 },
  collectionName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  collectionDesc: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  collectionCount: { fontSize: 11, color: COLORS.accent, fontWeight: '600', marginTop: 4 },

  collectionOutfits: {
    paddingHorizontal: 14, paddingBottom: 14, gap: 10,
  },


  outfitCard: {
    backgroundColor: COLORS.card, borderRadius: 14,
    padding: 14, gap: 10,
  },
  outfitItemsPreview: { flexDirection: 'row', alignItems: 'center' },
  itemEmojiBox: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 1,
  },
  itemEmoji: { fontSize: 18 },
  itemEmojiMore: { backgroundColor: COLORS.iconBg },
  itemEmojiMoreText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },

  outfitCardInfo: { gap: 2 },
  outfitCardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  outfitCardOccasion: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  outfitCardItems: { fontSize: 11, color: COLORS.muted },

  outfitCardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.white, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.border,
  },
  aiBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.accent },
});