import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Image, Dimensions, Alert, Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentLight: '#f7edec',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  iconBg: '#e3c8c5',
  success: '#6abf7b',
  successLight: '#e8f5e9',
  gold: '#f9a825',
  goldLight: '#fff8e1',
};


const POINTS_PER_CONDITION = {
  'Like New': 50,
  'Good': 30,
  'Fair': 15,
};

// ─── WARDROBE ITEMS ───────────────────────────────────────────────────────
// TODO (Hunia & Aynour):
// Replace this mock data with a real API call to get the user's wardrobe.
//
// API Endpoint:   GET /api/wardrobe/:userId
// Auth:           Bearer token in Authorization header
//
// Expected response (array of objects):
// [
//   {
//     id: "abc123",
//     name: "White Linen Shirt",
//     category: "Tops",        // Tops | Bottoms | Dresses | Shoes | Bags | Accessories | Outerwear
//     brand: "Zara",
//     color: "White",
//     condition: "Good",       // "Like New" | "Good" | "Fair"
//     image: null              // image URL string or null
//   }
// ]
//
// Replace the WARDROBE_ITEMS constant with:
//
//   const [wardrobeItems, setWardrobeItems] = useState([]);
//   useEffect(() => {
//     fetch(`/api/wardrobe/${userId}`, {
//       headers: { Authorization: `Bearer ${userToken}` }
//     })
//       .then(r => r.json())
//       .then(data => setWardrobeItems(data))
//       .catch(err => console.error('Failed to load wardrobe:', err));
//   }, [userId]);

const WARDROBE_ITEMS = [
  { id: 'w1', name: 'White Linen Shirt', category: 'Tops', brand: 'Zara', color: 'White', condition: 'Good', image: null },
  { id: 'w2', name: 'High-Waist Beige Trousers', category: 'Bottoms', brand: 'Mango', color: 'Beige', condition: 'Good', image: null },
  { id: 'w3', name: 'Floral Midi Dress', category: 'Dresses', brand: 'H&M', color: 'Floral', condition: 'Like New', image: null },
  { id: 'w4', name: 'Oversized Denim Jacket', category: 'Tops', brand: "Levi's", color: 'Blue', condition: 'Fair', image: null },
  { id: 'w5', name: 'Black Slim Jeans', category: 'Bottoms', brand: 'Zara', color: 'Black', condition: 'Good', image: null },
  { id: 'w6', name: 'Silk Cami Top', category: 'Tops', brand: 'ASOS', color: 'Dusty Rose', condition: 'Like New', image: null },
  { id: 'w7', name: 'White Leather Sneakers', category: 'Shoes', brand: 'Adidas', color: 'White', condition: 'Good', image: null },
  { id: 'w8', name: 'Beige Trench Coat', category: 'Outerwear', brand: 'Massimo Dutti', color: 'Beige', condition: 'Like New', image: null },
];

// ─── DONATION CENTERS ─────────────────────────────────────────────────────
// TODO (Hunia & Aynour):
// Replace this mock data with a real API call to get donation centers
// near the user's location.
//
// API Endpoint:   GET /api/donation-centers?lat=LATITUDE&lng=LONGITUDE
// Auth:           Bearer token in Authorization header
//
// Expected response (array of objects):
// [
//   {
//     id: "c1",
//     name: "Emirates Red Crescent",
//     address: "Al Qusais, Dubai",
//     distance: "1.2 km",       // calculated from user's location
//     phone: "+971 4 123 4567",
//     hours: "Mon–Sat 9AM–6PM",
//     accepts: ["Clothes", "Shoes", "Bags"],
//     verified: true             // true = FASH verified center
//   }
// ]
//
// Replace the DONATION_CENTERS constant with:
//
//   const [centers, setCenters] = useState([]);
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(pos => {
//       const { latitude, longitude } = pos.coords;
//       fetch(`/api/donation-centers?lat=${latitude}&lng=${longitude}`, {
//         headers: { Authorization: `Bearer ${userToken}` }
//       })
//         .then(r => r.json())
//         .then(data => setCenters(data))
//         .catch(err => console.error('Failed to load centers:', err));
//     });
//   }, []);

const DONATION_CENTERS = [
  {
    id: 'c1',
    name: 'Emirates Red Crescent',
    address: 'Al Qusais, Dubai',
    distance: '1.2 km',
    phone: '+971 4 123 4567',
    hours: 'Mon–Sat 9AM–6PM',
    accepts: ['Clothes', 'Shoes', 'Bags'],
    verified: true,
  },
  {
    id: 'c2',
    name: 'Dubai Cares Drop-off',
    address: 'Jumeirah, Dubai',
    distance: '3.4 km',
    phone: '+971 4 234 5678',
    hours: 'Daily 8AM–8PM',
    accepts: ['Clothes', 'Accessories'],
    verified: true,
  },
  {
    id: 'c3',
    name: 'Goodwill Thrift Store',
    address: 'Deira, Dubai',
    distance: '5.1 km',
    phone: '+971 4 345 6789',
    hours: 'Mon–Fri 10AM–5PM',
    accepts: ['Clothes', 'Shoes', 'Bags', 'Accessories'],
    verified: false,
  },
];

// ─── CURRENT USER POINTS ──────────────────────────────────────────────────
// TODO (Hunia & Aynour):
// Fetch the user's current points balance from MongoDB.
//
// API Endpoint:   GET /api/users/:userId/points
// Auth:           Bearer token in Authorization header
//
// Expected response:
// { points: 120, totalDonated: 5, level: "Silver Donor" }
//
// Replace the mock value below with the real fetched value.

const USER_CURRENT_POINTS = 120;

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗',
  Shoes: '👟', Bags: '👜', Accessories: '✨', Outerwear: '🧥',
};

const CONDITION_STYLES = {
  'Like New': { bg: '#e8f5e9', text: '#388e3c' },
  'Good': { bg: '#fff8e1', text: '#f9a825' },
  'Fair': { bg: '#fce4ec', text: '#c2185b' },
};


const PointsBadge = ({ points }) => (
  <View style={styles.pointsBadge}>
    <Text style={styles.pointsStar}>⭐</Text>
    <Text style={styles.pointsValue}>{points}</Text>
    <Text style={styles.pointsLabel}>pts</Text>
  </View>
);

export default function DonationScreen({ navigation }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('donate');
  const [submitted, setSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalPointsToEarn = selectedItems.reduce((sum, id) => {
    const item = WARDROBE_ITEMS.find((w) => w.id === id);
    return sum + (item ? POINTS_PER_CONDITION[item.condition] || 0 : 0);
  }, 0);

  // ─── SUBMIT DONATION ─────────────────────────────────────────────────
  // TODO (Hunia & Aynour):
  // When user confirms donation, send to backend:
  //
  // API Endpoint:   POST /api/donations
  // Auth:           Bearer token in Authorization header
  // Request body:
  // {
  //   userId: "user_id_here",
  //   itemIds: ["w1", "w3", "w5"],
  //   pointsEarned: 110          // calculated from item conditions
  // }
  //
  // What the backend (seif aw hunia)should do:
  //   1. Mark the donated items as "donated" in the wardrobe collection
  //   2. Add the earned points to the user's points balance
  //   3. Create a donation record in a "donations" collection
  //   4. Return: { success: true, newPointsBalance: 230 }
  //
  // After success:
  //   - Remove donated items from the wardrobe list on screen
  //   - Show the success screen with earned points

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please select at least one item to donate.');
      return;
    }
    Alert.alert(
      'Confirm Donation',
      `Donate ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} and earn ${totalPointsToEarn} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Donate & Earn Points',
          onPress: () => {
            // TODO: replace with real API call (see above)
            setEarnedPoints(totalPointsToEarn);
            setSubmitted(true);
          },
        },
      ]
    );
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Donation</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.successScreen}>
          <View style={styles.successIconWrap}>
            <Ionicons name="heart" size={52} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>Thank you! 🎉</Text>
          <Text style={styles.successSub}>
            Your {selectedItems.length} item{selectedItems.length > 1 ? 's have' : ' has'} been marked for donation.
          </Text>

    
          <View style={styles.pointsEarnedCard}>
            <Text style={styles.pointsEarnedEmoji}>⭐</Text>
            <Text style={styles.pointsEarnedValue}>+{earnedPoints}</Text>
            <Text style={styles.pointsEarnedLabel}>points earned!</Text>
            <Text style={styles.pointsEarnedTotal}>
              New balance: {USER_CURRENT_POINTS + earnedPoints} pts
            </Text>
          </View>

     
          <View style={styles.pointsInfoCard}>
            <Text style={styles.pointsInfoTitle}>Use your points for</Text>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Discounts on marketplace items</Text>
            </View>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="hammer-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Bid boosts in live auctions</Text>
            </View>
            <View style={styles.pointsInfoRow}>
              <Ionicons name="star-outline" size={14} color={COLORS.accent} />
              <Text style={styles.pointsInfoText}>Exclusive FASH rewards</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>
 
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Donation</Text>
          <Text style={styles.headerSub}>Give back · Earn points</Text>
        </View>
        <PointsBadge points={USER_CURRENT_POINTS} />
      </View>

      <View style={styles.pointsBanner}>
        <Text style={styles.pointsBannerEmoji}>⭐</Text>
        <View style={styles.pointsBannerText}>
          <Text style={styles.pointsBannerTitle}>Earn points for every donation</Text>
          <Text style={styles.pointsBannerSub}>
            Like New = 50pts · Good = 30pts · Fair = 15pts
          </Text>
        </View>
      </View>

   
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'donate' && styles.tabActive]}
          onPress={() => setActiveTab('donate')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="heart-outline"
            size={15}
            color={activeTab === 'donate' ? COLORS.white : COLORS.muted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'donate' && styles.tabTextActive]}>
            My Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'centers' && styles.tabActive]}
          onPress={() => setActiveTab('centers')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="location-outline"
            size={15}
            color={activeTab === 'centers' ? COLORS.white : COLORS.muted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.tabText, activeTab === 'centers' && styles.tabTextActive]}>
            Centers
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeTab === 'donate' ? (
          <>
            <Text style={styles.sectionLabel}>
              Select items to donate · {WARDROBE_ITEMS.length} in wardrobe
            </Text>

            {WARDROBE_ITEMS.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const pts = POINTS_PER_CONDITION[item.condition];
              const condStyle = CONDITION_STYLES[item.condition];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.85}
                >
              
                  <View style={[styles.itemEmoji, isSelected && styles.itemEmojiSelected]}>
                    <Text style={styles.itemEmojiText}>
                      {CATEGORY_EMOJIS[item.category] || '👕'}
                    </Text>
                  </View>

                
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{item.brand} · {item.color}</Text>
                    <View style={styles.itemTagRow}>
                      <View style={[styles.conditionTag, { backgroundColor: condStyle.bg }]}>
                        <Text style={[styles.conditionText, { color: condStyle.text }]}>
                          {item.condition}
                        </Text>
                      </View>
                      <View style={styles.pointsTag}>
                        <Text style={styles.pointsTagText}>+{pts} pts</Text>
                      </View>
                    </View>
                  </View>

            
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>
              Donation Centers Near You · {DONATION_CENTERS.length} found
            </Text>

            {DONATION_CENTERS.map((center) => (
              <View key={center.id} style={styles.centerCard}>
                {/* Header */}
                <View style={styles.centerHeader}>
                  <View style={styles.centerIconWrap}>
                    <Ionicons name="location" size={20} color={COLORS.accent} />
                  </View>
                  <View style={styles.centerInfo}>
                    <View style={styles.centerTitleRow}>
                      <Text style={styles.centerName}>{center.name}</Text>
                      {center.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="shield-checkmark" size={10} color={COLORS.white} />
                          <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.centerAddress}>{center.address}</Text>
                    <Text style={styles.centerDistance}>📍 {center.distance} away</Text>
                  </View>
                </View>

                <View style={styles.centerDetails}>
                  <View style={styles.centerDetailRow}>
                    <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.centerDetailText}>{center.hours}</Text>
                  </View>
                  <View style={styles.centerDetailRow}>
                    <Ionicons name="call-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.centerDetailText}>{center.phone}</Text>
                  </View>
                </View>

          
                <View style={styles.acceptsRow}>
                  {center.accepts.map((a) => (
                    <View key={a} style={styles.acceptTag}>
                      <Text style={styles.acceptTagText}>{a}</Text>
                    </View>
                  ))}
                </View>

                {/* CTA */}
                <TouchableOpacity
                  style={styles.directionsBtn}
                  activeOpacity={0.85}
                  onPress={() => Alert.alert('Directions', `Opening maps for ${center.name}`)}
                >
                  <Ionicons name="navigate-outline" size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={styles.directionsBtnText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky submit bar — only show on donate tab when items selected */}
      {activeTab === 'donate' && (
        <View style={styles.submitBar}>
          <View style={styles.submitBarLeft}>
            <Text style={styles.submitBarCount}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Text>
            {totalPointsToEarn > 0 && (
              <Text style={styles.submitBarPoints}>⭐ +{totalPointsToEarn} pts</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, selectedItems.length === 0 && { opacity: 0.4 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Ionicons name="heart-outline" size={15} color={COLORS.white} style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>Donate</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  logoHeader: { paddingBottom: 10, alignItems: 'center', backgroundColor: COLORS.bg },
  logo: { width: 120, height: 50 },

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

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  headerSub: { fontSize: 13, color: COLORS.muted, marginTop: 2 },

  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.goldLight, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#f9e0a0',
  },
  pointsStar: { fontSize: 14 },
  pointsValue: { fontSize: 16, fontWeight: '800', color: COLORS.gold },
  pointsLabel: { fontSize: 11, color: COLORS.gold, fontWeight: '600' },

  pointsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.goldLight, marginHorizontal: 16,
    borderRadius: 14, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#f9e0a0',
  },
  pointsBannerEmoji: { fontSize: 24 },
  pointsBannerText: { flex: 1 },
  pointsBannerTitle: { fontSize: 13, fontWeight: '700', color: '#7a5c00' },
  pointsBannerSub: { fontSize: 11, color: '#a07830', marginTop: 2 },

  tabRow: {
    flexDirection: 'row', marginHorizontal: 16,
    backgroundColor: COLORS.card, borderRadius: 14,
    padding: 4, marginBottom: 16,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
  },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  tabTextActive: { color: COLORS.white },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12,
  },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.white, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  itemRowSelected: {
    borderColor: COLORS.accent, backgroundColor: COLORS.accentLight,
  },
  itemEmoji: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  itemEmojiSelected: { backgroundColor: COLORS.white },
  itemEmojiText: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  itemMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  itemTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  conditionTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  conditionText: { fontSize: 10, fontWeight: '700' },
  pointsTag: {
    backgroundColor: COLORS.goldLight, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 7,
  },
  pointsTagText: { fontSize: 10, fontWeight: '700', color: COLORS.gold },

  checkbox: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },

  centerCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  centerHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  centerIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  centerInfo: { flex: 1 },
  centerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  centerName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.accent, borderRadius: 7,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  verifiedText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
  centerAddress: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  centerDistance: { fontSize: 11, color: COLORS.accent, fontWeight: '600', marginTop: 2 },

  centerDetails: { gap: 6, marginBottom: 12 },
  centerDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  centerDetailText: { fontSize: 12, color: COLORS.muted },

  acceptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  acceptTag: {
    backgroundColor: COLORS.card, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  acceptTagText: { fontSize: 11, fontWeight: '600', color: COLORS.accent },

  directionsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12,
  },
  directionsBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  submitBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  submitBarLeft: { gap: 2 },
  submitBarCount: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  submitBarPoints: { fontSize: 12, fontWeight: '700', color: COLORS.gold },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 24, paddingVertical: 14,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  successScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.accentLight, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  successSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },

  pointsEarnedCard: {
    alignItems: 'center', backgroundColor: COLORS.goldLight,
    borderRadius: 20, padding: 24, width: '100%', marginBottom: 16,
    borderWidth: 1, borderColor: '#f9e0a0',
  },
  pointsEarnedEmoji: { fontSize: 36, marginBottom: 6 },
  pointsEarnedValue: { fontSize: 48, fontWeight: '900', color: COLORS.gold },
  pointsEarnedLabel: { fontSize: 16, fontWeight: '700', color: '#7a5c00', marginTop: 4 },
  pointsEarnedTotal: { fontSize: 13, color: '#a07830', marginTop: 8 },

  pointsInfoCard: {
    backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, width: '100%', marginBottom: 24, gap: 10,
  },
  pointsInfoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  pointsInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointsInfoText: { fontSize: 13, color: COLORS.muted },

  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 40,
  },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});