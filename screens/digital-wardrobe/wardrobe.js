import React from 'react';
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
};

const TIPS = [
  {
    icon: 'hanger',
    lib: 'mci',
    title: 'Upload your clothes',
    sub: 'Photo or manual entry',
  },
  {
    icon: 'sparkles-outline',
    lib: 'ion',
    title: 'Get AI outfit picks',
    sub: 'Smart styling suggestions',
  },
  {
    icon: 'heart-outline',
    lib: 'ion',
    title: 'Save marketplace items',
    sub: 'Wishlist from FASH & C2C',
  },
];

const TipIcon = ({ icon, lib }) => {
  if (lib === 'mci')
    return <MaterialCommunityIcons name={icon} size={20} color={COLORS.accent} />;
  return <Ionicons name={icon} size={20} color={COLORS.accent} />;
};

export default function WardrobeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wardrobe</Text>
        <Text style={styles.headerSub}>0 items · 0 outfits</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Empty hero */}
        <View style={styles.emptyHero}>
          <View style={styles.iconRing}>
            <MaterialCommunityIcons name="wardrobe-outline" size={48} color={COLORS.accent} />
          </View>
          <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
          <Text style={styles.emptySub}>
            Add your first item and start building your digital closet
          </Text>

          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('UploadTab')}
          >
            <Feather name="plus" size={16} color={COLORS.white} style={{ marginRight: 7 }} />
            <Text style={styles.btnPrimaryText}>Add First Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.8}>
            <Ionicons name="compass-outline" size={16} color={COLORS.accent} style={{ marginRight: 7 }} />
            <Text style={styles.btnOutlineText}>Browse Inspiration</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <Text style={styles.sectionLabel}>What you can do</Text>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <TipIcon icon={tip.icon} lib={tip.lib} />
            </View>
            <View style={styles.tipText}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipSub}>{tip.sub}</Text>
            </View>
            <Feather name="chevron-right" size={14} color={COLORS.muted} />
          </View>
        ))}
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

  scrollContent: { paddingBottom: 48 },

  emptyHero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 52,
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  tipSub: { fontSize: 12, color: COLORS.muted, marginTop: 3 },
});