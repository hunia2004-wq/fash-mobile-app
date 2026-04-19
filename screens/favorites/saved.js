import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  iconBg: '#e3c8c5',
  c2cBg: '#e0ede8',
  c2cText: '#3a7a5e',
  outfitBg: '#e8daf8',
  outfitText: '#6b3fa0',
};

const TABS = ['All', 'FASH', 'Marketplace', 'Outfits'];

const SAVE_TYPES = [
  {
    icon: <MaterialCommunityIcons name="shopping-outline" size={20} color={COLORS.accent} />,
    title: 'FASH originals',
    sub: 'Exclusive & limited pieces',
    badge: { label: 'FASH', bg: COLORS.accent, color: COLORS.white },
  },
  {
    icon: <Ionicons name="people-outline" size={20} color={COLORS.accent} />,
    title: 'C2C marketplace items',
    sub: 'From other FASH members',
    badge: { label: 'Marketplace', bg: COLORS.c2cBg, color: COLORS.c2cText },
  },
  {
    icon: <Ionicons name="sparkles-outline" size={20} color={COLORS.accent} />,
    title: 'AI-styled outfits',
    sub: 'Save looks you love',
    badge: { label: 'AI Outfit', bg: COLORS.outfitBg, color: COLORS.outfitText },
  },
];

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <Text style={styles.headerSub}>Your wishlist & favorites</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Empty hero */}
        <View style={styles.emptyHero}>
          <View style={styles.iconRing}>
            <Ionicons name="heart-outline" size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap the{' '}
            <Text style={{ color: COLORS.accent, fontWeight: '600' }}>♥</Text>
            {' '}on any item from FASH or the marketplace to save it here
          </Text>

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
            <Ionicons name="storefront-outline" size={16} color={COLORS.white} style={{ marginRight: 7 }} />
            <Text style={styles.btnPrimaryText}>Explore Marketplace</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
            <Feather name="grid" size={15} color={COLORS.accent} style={{ marginRight: 7 }} />
            <Text style={styles.btnOutlineText}>Browse FASH</Text>
          </TouchableOpacity>
        </View>

        {/* What can be saved */}
        <Text style={styles.sectionLabel}>You can save</Text>
        {SAVE_TYPES.map((item, i) => (
          <View key={i} style={styles.typeCard}>
            <View style={styles.typeIconWrap}>{item.icon}</View>
            <View style={styles.typeText}>
              <Text style={styles.typeTitle}>{item.title}</Text>
              <Text style={styles.typeSub}>{item.sub}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.badge.bg }]}>
              <Text style={[styles.badgeText, { color: item.badge.color }]}>
                {item.badge.label}
              </Text>
            </View>
          </View>
        ))}

        {/* Empty state hint specific to active tab */}
        {activeTab !== 'All' && (
          <View style={styles.tabHint}>
            <Feather name="info" size={14} color={COLORS.muted} style={{ marginRight: 8 }} />
            <Text style={styles.tabHintText}>
              {activeTab === 'FASH' && 'Items from FASH\'s own brand will appear here.'}
              {activeTab === 'Marketplace' && 'Items saved from C2C sellers will appear here.'}
              {activeTab === 'Outfits' && 'AI-generated outfits you save will appear here.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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

  tabsWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 14 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 2,
  },
  tabActive: { borderBottomColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: COLORS.accent },

  scrollContent: { paddingBottom: 50 },

  emptyHero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 12,
  },
  btnPrimaryText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 15,
    width: '100%',
  },
  btnOutlineText: { color: COLORS.accent, fontSize: 15, fontWeight: '600' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },

  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeText: { flex: 1 },
  typeTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  typeSub: { fontSize: 12, color: COLORS.muted, marginTop: 3 },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  tabHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 14,
    padding: 14,
  },
  tabHintText: { flex: 1, fontSize: 12, color: COLORS.muted, lineHeight: 18 },
});