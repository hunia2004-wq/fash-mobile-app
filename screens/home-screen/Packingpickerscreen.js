import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from './Packingdata';
import { useAuth } from '../../context/AuthContext';
import { getOutfits, deleteOutfit } from '../../services/authService';

const { width } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗', Shoes: '👟',
  Bags: '👜', Accessories: '✨', Outerwear: '🧥',
};

// Shows actual item image if available, otherwise emoji
const ItemPreviewBubble = ({ item, style, index }) => {
  const marginLeft = index > 0 ? -10 : 0;
  const zIndex = 10 - index;

  if (item?.image) {
    return (
      <Image
        source={{ uri: item.image }}
        style={[styles.itemEmojiBox, { marginLeft, zIndex, overflow: 'hidden' }]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.itemEmojiBox, { marginLeft, zIndex }]}>
      <Text style={styles.itemEmoji}>{CATEGORY_EMOJIS[item?.category] || '👕'}</Text>
    </View>
  );
};

const OutfitCard = ({ outfit, onPress, onSendToAI, onDelete }) => (
  <TouchableOpacity style={styles.outfitCard} onPress={onPress} activeOpacity={0.88}>
    <View style={styles.outfitItemsPreview}>
      {outfit.items.slice(0, 3).map((item, i) => (
        <ItemPreviewBubble key={i} item={item} index={i} />
      ))}
      {outfit.items.length > 3 && (
        <View style={[styles.itemEmojiBox, styles.itemEmojiMore, { marginLeft: -10 }]}>
          <Text style={styles.itemEmojiMoreText}>+{outfit.items.length - 3}</Text>
        </View>
      )}
    </View>
    <View style={styles.outfitCardInfo}>
      <Text style={styles.outfitCardName}>{outfit.name}</Text>
      <Text style={styles.outfitCardOccasion}>
        {[outfit.occasion, outfit.season].filter(Boolean).join(' · ')}
      </Text>
      <Text style={styles.outfitCardItems} numberOfLines={1}>
        {outfit.items.map(i => i.name).join(', ')}
      </Text>
    </View>
    <View style={styles.outfitCardActions}>
      <TouchableOpacity style={styles.aiBtn} onPress={() => onSendToAI(outfit)} activeOpacity={0.8}>
        <MaterialCommunityIcons name="magic-staff" size={13} color={COLORS.accent} />
        <Text style={styles.aiBtnText}>Style with AI</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(outfit._id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={16} color="#E05C5C" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function OutfitPickerScreen({ navigation }) {
  const { getToken } = useAuth();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await getOutfits(token);
      setOutfits(data.outfits ?? data ?? []);
    } catch (err) {
      console.error('Failed to fetch outfits:', err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useFocusEffect(
    useCallback(() => { fetchOutfits(); }, [fetchOutfits])
  );

  const handleSendToAI = (outfit) => {
    const itemNames = outfit.items.map(i => i.name).join(', ');
    const message = `Can you help me style this outfit: ${itemNames}? The occasion is ${outfit.occasion || 'casual'}.`;
    navigation.navigate('AIStylingScreen', { prefillMessage: message });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Outfit', 'Are you sure you want to delete this outfit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await deleteOutfit(token, id);
            setOutfits(prev => prev.filter(o => o._id !== id));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.logoHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </TouchableOpacity>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Outfits</Text>
          <Text style={styles.headerSub}>{outfits.length} saved outfits</Text>
        </View>
        <TouchableOpacity
          style={styles.buildBtn}
          onPress={() => navigation.navigate('PackingBuilderscreen')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.buildBtnText}>Build</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('AIStylingScreen', {})}
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
          onPress={() => navigation.navigate('PackingBuilderscreen')}
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

        <Text style={styles.sectionLabel}>Saved Outfits</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : outfits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="hanger" size={48} color={COLORS.card} />
            <Text style={styles.emptyTitle}>No outfits yet</Text>
            <Text style={styles.emptySub}>Tap "Build" to create your first outfit.</Text>
          </View>
        ) : (
          outfits.map(outfit => (
            <OutfitCard
              key={outfit._id}
              outfit={outfit}
              onPress={() => navigation.navigate('PackingDetail', { outfit })}
              onSendToAI={handleSendToAI}
              onDelete={handleDelete}
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },
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