import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Linking, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { initiateSubscription, getMySubscription } from '../services/authService';

const { width } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary: '#C17C74',
  bg: '#F5F5F5',
  card: '#F2E6E3',
  cardDeep: '#EDD8D4',
  white: '#FFFFFF',
  ink: '#3D2420',
  inkMid: '#7A5550',
  inkLight: '#B09490',
  border: 'rgba(193,124,116,0.20)',
  green: '#4CAF82',
  greenBg: '#EBF7F1',
};

// ─── Prices ───────────────────────────────────────────────────────────────────
const PRICES = {
  monthly: { basic: 79, pro: 149 },
  yearly: { basic: 55, pro: 104 },
};

// ─── All features, tagged with which plans include them ───────────────────────
// plans: ['basic'] | ['pro'] | ['basic','pro']
const ALL_FEATURES = [
  {
    iconLib: 'ion',
    icon: 'chatbubble-ellipses',
    title: 'AI Styling',
    desc: 'Chat with your personal AI stylist for outfit ideas and daily inspiration.',
    tag: { basic: '10 / day', pro: 'Unlimited' },
    plans: ['basic', 'pro'],
  },
  {
    iconLib: 'ion',
    icon: 'bar-chart',
    title: 'Seller Analytics',
    desc: 'Track views, saves, and conversion rates on all your listings.',
    tag: { basic: 'Included', pro: 'Included' },
    plans: ['basic', 'pro'],
  },
  {
    iconLib: 'ion',
    icon: 'headset',
    title: 'Priority Support',
    desc: 'Skip the queue — dedicated support with faster response times.',
    tag: { basic: 'Included', pro: 'Included' },
    plans: ['basic', 'pro'],
  },
  {
    iconLib: 'mci',
    icon: 'augmented-reality',
    title: 'AR Try-On',
    desc: 'See how any garment looks on you live through your camera.',
    tag: { pro: 'Pro only' },
    plans: ['pro'],
  },
  {
    iconLib: 'ion',
    icon: 'shield-checkmark',
    title: 'Trusted Seller Badge',
    desc: 'A verified badge builds buyer trust and boosts your sales.',
    tag: { pro: 'Pro only' },
    plans: ['pro'],
  },
  {
    iconLib: 'ion',
    icon: 'flash',
    title: 'Priority Listing Boost',
    desc: 'Your items appear first in search results and category pages.',
    tag: { pro: 'Pro only' },
    plans: ['pro'],
  },
];

const TRUST = [
  { num: '12k+', label: 'Members' },
  { num: '4.9★', label: 'Rating' },
  { num: '3×', label: 'More sales' },
];

// ─── Icon helper ──────────────────────────────────────────────────────────────
const FIcon = ({ lib, name, size, color }) =>
  lib === 'mci'
    ? <MaterialCommunityIcons name={name} size={size} color={color} />
    : <Ionicons name={name} size={size} color={color} />;

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PremiumPlanScreen({ navigation }) {
  const [billing, setBilling] = useState('monthly');
  const [selected, setSelected] = useState('pro');
  const { getToken } = useAuth();
  const [subscribing, setSubscribing] = useState(false);
  const [currentSub, setCurrentSub] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const data = await getMySubscription(token);
        setCurrentSub(data);
      } catch { }
    };
    load();
  }, []);

  const handleSubscribe = async () => {
    try {
      setSubscribing(true);
      const token = await getToken();
      const data = await initiateSubscription(token, selected, billing);
      const url = data.paymentUrl ?? data.data?.paymentUrl;
      if (!url) throw new Error('Payment URL not returned.');
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubscribing(false);
    }
  };

  const price = PRICES[billing];
  const selectedLabel = selected === 'pro' ? 'Pro' : 'Basic';
  const ctaText = `Start ${selectedLabel} — EGP ${price[selected]}/mo`;

  // Filter to only features available for the selected plan
  const visibleFeatures = ALL_FEATURES.filter(f => f.plans.includes(selected));
  // Features shared across both plans (shown when pro is selected, to highlight value)
  const isProOnly = (f) => f.plans.length === 1 && f.plans[0] === 'pro';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={C.primary} />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>Go Premium</Text>
          <View style={s.placeholder} />
        </View>

        {/* ── Hero Card ────────────────────────────────────────────────────── */}
        <View style={s.heroPad}>
          <View style={s.heroCard}>
            <View style={s.heroCircle1} />
            <View style={s.heroCircle2} />
            <View style={s.crownWrap}>
              <Ionicons name="diamond" size={22} color={C.white} />
            </View>
            <Text style={s.heroEyebrow}>FASH Premium</Text>
            <Text style={s.heroTitle}>Dress smarter,{'\n'}sell faster.</Text>
            <Text style={s.heroSub}>
              Unlock AR try-on, unlimited AI styling, and your verified seller badge.
            </Text>
            <View style={s.badgeRow}>
              {[
                { lib: 'mci', icon: 'augmented-reality', label: 'AR Try-On' },
                { lib: 'mci', icon: 'robot-outline', label: 'AI Styling' },
                { lib: 'ion', icon: 'shield-checkmark', label: 'Verified Badge' },
              ].map(b => (
                <View key={b.label} style={s.heroBadge}>
                  <FIcon lib={b.lib} name={b.icon} size={11} color={C.white} />
                  <Text style={s.heroBadgeText}> {b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Plan Toggle + Cards ──────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Choose your plan</Text>

          {/* Monthly / Yearly toggle */}
          <View style={s.toggle}>
            {['monthly', 'yearly'].map(b => (
              <TouchableOpacity
                key={b}
                style={[s.toggleBtn, billing === b && s.toggleBtnActive]}
                onPress={() => setBilling(b)}
                activeOpacity={0.8}
              >
                <Text style={[s.toggleText, billing === b && s.toggleTextActive]}>
                  {b === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
                {b === 'yearly' && (
                  <View style={[s.savePill, billing === 'yearly' && s.savePillActive]}>
                    <Text style={[s.savePillText, billing === 'yearly' && s.savePillTextActive]}>
                      -30%
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Plan Cards */}
          {['basic', 'pro'].map(plan => (
            <TouchableOpacity
              key={plan}
              style={[s.planCard, selected === plan && s.planCardOn]}
              onPress={() => setSelected(plan)}
              activeOpacity={0.85}
            >
              {plan === 'pro' && (
                <View style={s.popularTag}>
                  <Text style={s.popularTagText}>Most popular</Text>
                </View>
              )}
              <View style={s.planRow}>
                <View style={[s.radio, selected === plan && s.radioOn]}>
                  {selected === plan && <View style={s.radioDot} />}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.planName}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Text>
                  <Text style={s.planDesc}>
                    {plan === 'basic'
                      ? 'Essential features to get started'
                      : 'Full access to all premium tools'}
                  </Text>
                  {billing === 'yearly' && (
                    <Text style={s.planSaveText}>
                      Save EGP {plan === 'basic' ? 288 : 540} / year
                    </Text>
                  )}
                </View>
                <View style={s.priceBox}>
                  <Text style={s.priceAmount}>EGP {price[plan]}</Text>
                  <Text style={s.pricePeriod}>/ mo</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Features for selected plan ───────────────────────────────────── */}
        <View style={s.section}>
          {/* Header row with plan badge */}
          <View style={s.featureHeaderRow}>
            <Text style={s.sectionLabel}>What's included</Text>
            <View style={s.planBadge}>
              <Ionicons
                name={selected === 'pro' ? 'diamond' : 'checkmark-circle'}
                size={11}
                color={C.white}
              />
              <Text style={s.planBadgeText}>
                {' '}{selectedLabel} plan
              </Text>
            </View>
          </View>

          {/* Feature list — original card style */}
          <View style={s.featureList}>
            {visibleFeatures.map((f, idx) => {
              const proOnly = isProOnly(f);
              const tagLabel = f.tag[selected] || f.tag.pro || f.tag.basic;
              return (
                <View key={f.title} style={s.featureCard}>
                  {/* Icon */}
                  <View style={[s.featureIconWrap, proOnly && s.featureIconWrapPro]}>
                    <FIcon
                      lib={f.iconLib}
                      name={f.icon}
                      size={20}
                      color={proOnly ? C.white : C.primary}
                    />
                  </View>

                  {/* Text */}
                  <View style={s.featureBody}>
                    <View style={s.featureTitleRow}>
                      <Text style={s.featureTitle}>{f.title}</Text>
                      {proOnly && (
                        <View style={s.proOnlyBadge}>
                          <Ionicons name="diamond" size={9} color={C.primary} />
                          <Text style={s.proOnlyText}> Pro</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.featureDesc}>{f.desc}</Text>
                    {/* Tag pill */}
                    <View style={[s.featureTag, proOnly ? s.featureTagPro : s.featureTagShared]}>
                      <Ionicons
                        name={proOnly ? 'star' : 'checkmark'}
                        size={10}
                        color={proOnly ? C.primary : C.green}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={[s.featureTagText, proOnly ? s.featureTagTextPro : s.featureTagTextShared]}>
                        {tagLabel}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Upsell hint when Basic is selected */}
          {selected === 'basic' && (
            <TouchableOpacity
              style={s.upsellBanner}
              onPress={() => setSelected('pro')}
              activeOpacity={0.85}
            >
              <View style={s.upsellLeft}>
                <Ionicons name="diamond" size={16} color={C.primary} />
                <Text style={s.upsellText}>
                  Upgrade to Pro for AR Try-On, Listing Boost & Seller Badge
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Trust Stats ──────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Trusted by our community</Text>
          <View style={s.trustRow}>
            {TRUST.map(t => (
              <View key={t.label} style={s.trustCard}>
                <Text style={s.trustNum}>{t.num}</Text>
                <Text style={s.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {currentSub?.status === 'active' && (
          <View style={{ backgroundColor: C.greenBg, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' }}>
            <Text style={{ color: C.green, fontWeight: '700', fontSize: 13 }}>
              ✓ You're on the {currentSub.plan} plan · Active until {new Date(currentSub.endDate).toLocaleDateString('en-GB')}
            </Text>
          </View>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <View style={s.ctaWrap}>
          <TouchableOpacity
            style={[s.ctaBtn, subscribing && { opacity: 0.6 }]}
            onPress={handleSubscribe}
            disabled={subscribing}
            activeOpacity={0.85}
          >
            {subscribing
              ? <ActivityIndicator size="small" color={C.white} />
              : <Ionicons name="diamond" size={18} color={C.white} />
            }
            <Text style={s.ctaBtnText}>
              {subscribing ? 'Redirecting...' : ctaText}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 48 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: C.ink },
  placeholder: { width: 38 },

  // Hero
  heroPad: { paddingHorizontal: 20 },
  heroCard: {
    backgroundColor: C.primary,
    borderRadius: 24, padding: 28, overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  heroCircle2: {
    position: 'absolute', bottom: -40, left: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  crownWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  heroEyebrow: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28, fontWeight: '700',
    color: C.white, lineHeight: 36, marginBottom: 8,
  },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 20 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.30)',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 11,
  },
  heroBadgeText: { fontSize: 11, color: C.white, fontWeight: '500' },

  // Section
  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: C.primary,
    letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 16,
  },

  // Toggle
  toggle: {
    flexDirection: 'row', backgroundColor: C.card,
    borderRadius: 14, padding: 4, marginBottom: 18, gap: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 11,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: C.primary },
  toggleText: { fontSize: 13, fontWeight: '500', color: C.inkMid },
  toggleTextActive: { color: C.white },
  savePill: {
    backgroundColor: C.cardDeep,
    borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 5,
  },
  savePillActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  savePillText: { fontSize: 10, fontWeight: '600', color: C.primary },
  savePillTextActive: { color: C.white },

  // Plan card
  planCard: {
    backgroundColor: C.card, borderRadius: 18,
    padding: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  planCardOn: { borderColor: C.primary, backgroundColor: C.white },
  popularTag: {
    position: 'absolute', top: 0, right: 18,
    backgroundColor: C.primary,
    paddingHorizontal: 10, paddingVertical: 3,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
  },
  popularTagText: { fontSize: 10, fontWeight: '600', color: C.white },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  planName: { fontSize: 15, fontWeight: '600', color: C.ink },
  planDesc: { fontSize: 12, color: C.inkMid, marginTop: 2 },
  planSaveText: { fontSize: 11, color: C.primary, fontWeight: '500', marginTop: 3 },
  priceBox: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 20, fontWeight: '700', color: C.primary },
  pricePeriod: { fontSize: 11, color: C.inkLight },

  // Features section header
  featureHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  planBadgeText: { fontSize: 11, fontWeight: '600', color: C.white },

  // Feature list
  featureList: { gap: 10 },
  featureCard: {
    backgroundColor: C.white,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderWidth: 0.5, borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureIconWrapPro: { backgroundColor: C.primary },
  featureBody: { flex: 1 },
  featureTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  featureTitle: { fontSize: 14, fontWeight: '600', color: C.ink },
  proOnlyBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FDF0EE',
    borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2,
  },
  proOnlyText: { fontSize: 10, fontWeight: '600', color: C.primary },
  featureDesc: { fontSize: 12, color: C.inkMid, lineHeight: 18, marginBottom: 8 },

  featureTag: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  featureTagPro: { backgroundColor: '#FDF0EE' },
  featureTagShared: { backgroundColor: C.greenBg },
  featureTagText: { fontSize: 10, fontWeight: '500' },
  featureTagTextPro: { color: C.primary },
  featureTagTextShared: { color: C.green },

  // Upsell banner
  upsellBanner: {
    marginTop: 14,
    backgroundColor: C.card,
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    gap: 10,
  },
  upsellLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  upsellText: { flex: 1, fontSize: 12, color: C.inkMid, lineHeight: 17 },

  // Trust
  trustRow: { flexDirection: 'row', gap: 10 },
  trustCard: {
    flex: 1, backgroundColor: C.card,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  trustNum: { fontSize: 20, fontWeight: '700', color: C.primary },
  trustLabel: { fontSize: 11, color: C.inkMid, marginTop: 3, textAlign: 'center' },

  // CTA
  ctaWrap: { paddingHorizontal: 20, paddingTop: 28 },
  ctaBtn: {
    backgroundColor: C.primary, borderRadius: 16, paddingVertical: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '600', color: C.white },
  ctaNote: { textAlign: 'center', fontSize: 11, color: C.inkLight, marginTop: 10 },
  restoreLink: {
    textAlign: 'center', fontSize: 12, color: C.primary,
    marginTop: 8, textDecorationLine: 'underline',
  },
});