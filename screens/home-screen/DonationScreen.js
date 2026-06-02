import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Image, Alert, ActivityIndicator, TextInput, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { getWardrobeItems, getNearbyCenters, createDonation, getPointsGuide, getAddresses, } from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  success: '#6abf7b', successLight: '#e8f5e9',
  gold: '#f9a825', goldLight: '#fff8e1',
};

const CATEGORY_EMOJIS = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗',
  Shoes: '👟', Bags: '👜', Accessories: '✨', Outerwear: '🧥',
};

const FRONTEND_POINTS = {
  'Pristine': 50,
  'Good': 30,
  'Faded': 15,
  'Discolored': 15,
  'Has Holes': 15,
  'Asymmetrical': 15,
  'Heavily Worn': 15,
};

// ── Detailed condition options ─────────────────────────────────────
// Each maps to a backend-accepted value for points calculation
const ITEM_CONDITIONS = [
  {
    key: 'Pristine',
    label: 'Pristine',
    description: 'No visible wear, like brand new',
    icon: '✨',
    backendValue: 'Like New',
    color: '#388e3c',
    bg: '#e8f5e9',
  },
  {
    key: 'Good',
    label: 'Good',
    description: 'Minor wear, no damage',
    icon: '👍',
    backendValue: 'Good',
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    key: 'Faded',
    label: 'Faded',
    description: 'Color has faded but fabric is intact',
    icon: '🌫️',
    backendValue: 'Fair',
    color: '#f9a825',
    bg: '#fff8e1',
  },
  {
    key: 'Discolored',
    label: 'Discolored',
    description: 'Stains or noticeable color issues',
    icon: '🎨',
    backendValue: 'Fair',
    color: '#e65100',
    bg: '#fff3e0',
  },
  {
    key: 'Has Holes',
    label: 'Has Holes',
    description: 'One or more holes or tears present',
    icon: '🕳️',
    backendValue: 'Fair',
    color: '#c2185b',
    bg: '#fce4ec',
  },
  {
    key: 'Asymmetrical',
    label: 'Asymmetrical',
    description: 'Shape or structural issues',
    icon: '↕️',
    backendValue: 'Fair',
    color: '#7b1fa2',
    bg: '#f3e5f5',
  },
  {
    key: 'Heavily Worn',
    label: 'Heavily Worn',
    description: 'Significant overall wear throughout',
    icon: '😓',
    backendValue: 'Fair',
    color: '#5d4037',
    bg: '#efebe9',
  },
];

const getConditionByKey = (key) => ITEM_CONDITIONS.find(c => c.key === key);

// ── Generate next 7 days ───────────────────────────────────────────
const generateDates = () => {
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      key: d.toISOString().split('T')[0],
      day: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
    });
  }
  return dates;
};

const TIME_SLOTS = ['9:00 AM – 12:00 PM', '12:00 PM – 3:00 PM', '3:00 PM – 6:00 PM'];

// ── Step indicator ─────────────────────────────────────────────────
const StepIndicator = ({ step, onStepPress }) => (
  <View style={styles.stepRow}>
    {[1, 2, 3, 4, 5].map(s => (
      <React.Fragment key={s}>
        <View style={styles.stepItem}>
          <TouchableOpacity
            onPress={() => s < step && onStepPress(s)}
            activeOpacity={s < step ? 0.7 : 1}
            style={[
              styles.stepCircle,
              step >= s && styles.stepCircleActive,
              s < step && styles.stepCircleClickable,
            ]}
          >
            {step > s
              ? <Ionicons name="checkmark" size={12} color={COLORS.white} />
              : <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>{s}</Text>
            }
          </TouchableOpacity>
          <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
            {s === 1 ? 'Items' : s === 2 ? 'Condition' : s === 3 ? 'Center' : s === 4 ? 'Pickup' : 'Done'}
          </Text>
        </View>
        {s < 5 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
      </React.Fragment>
    ))}
  </View>
);

const ItemImage = ({ item, style }) => {
  if (item.image) {
    return <Image source={{ uri: item.image }} style={style} resizeMode="cover" />;
  }
  return (
    <View style={[style, styles.emojiFallback]}>
      <Text style={styles.emojiFallbackText}>{CATEGORY_EMOJIS[item.category] || '👕'}</Text>
    </View>
  );
};

export default function DonationScreen({ navigation }) {
  const { getToken } = useAuth();

  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [centers, setCenters] = useState([]);
  const [pointsGuide, setPointsGuide] = useState({ 'Like New': 50, Good: 30, Fair: 15 });
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  // itemConditions: { [itemId]: conditionKey }
  const [itemConditions, setItemConditions] = useState({});
  const [selectedCenter, setSelectedCenter] = useState(null);

  const [pickupAddress, setPickupAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);

  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(true);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centersLoaded, setCentersLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const DATES = generateDates();

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const wardrobeData = await getWardrobeItems(token, 'All');
        console.log('total from backend:', wardrobeData?.items?.length ?? wardrobeData?.length);

        const raw = wardrobeData?.items ?? wardrobeData?.data ?? wardrobeData ?? [];
        const items = Array.isArray(raw) ? raw : [];
        console.log('after donated filter:', items.filter(i => !i.isDonated && !i.donated).length);

        setWardrobeItems(items.filter(i => !i.isDonated && !i.donated));

        const guideData = await getPointsGuide(token);
        const addressData = await getAddresses(token);

        const guide = guideData.data ?? guideData ?? {};
        if (Object.keys(guide).length > 0) setPointsGuide(guide);
        setSavedAddresses(addressData.addresses ?? addressData ?? []);
      } catch (err) {
        console.error('init error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Fetch centers ──────────────────────────────────────────────
  const fetchCenters = async () => {
    try {
      setCentersLoading(true);
      let lat = 30.0444, lng = 31.2357;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch { }
      const data = await getNearbyCenters(lat, lng);
      setCenters(data.data ?? data ?? []);
      setCentersLoaded(true);
    } catch (err) {
      Alert.alert('Error', 'Could not load donation centers. Please try again.');
    } finally {
      setCentersLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const toggleItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const setConditionForItem = (itemId, conditionKey) => {
    setItemConditions(prev => ({ ...prev, [itemId]: conditionKey }));
  };

  const getBackendCondition = (itemId) => {
    return itemConditions[itemId] ?? 'Good';
  };

  const getPointsForCondition = (itemId) =>
    FRONTEND_POINTS[itemConditions[itemId]] ?? 30;


  const totalPointsToEarn = selectedItems.reduce((sum, id) =>
    sum + getPointsForCondition(id), 0);

  const allConditionsSet = selectedItems.every(id => !!itemConditions[id]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
  };

  // ── Step navigation ────────────────────────────────────────────
  const handleProceedToCondition = () => {
    if (selectedItems.length === 0) {
      Alert.alert('No items selected', 'Please select at least one item to donate.');
      return;
    }
    setStep(2);
  };

  const handleProceedToCenter = () => {
    if (!allConditionsSet) {
      Alert.alert('Condition required', 'Please set the condition for all selected items.');
      return;
    }
    setStep(3);
    setActiveTab('centers');
    if (!centersLoaded && !centersLoading) fetchCenters();
  };

  const handleSelectCenter = (center) => {
    setSelectedCenter(center);
    setStep(4);
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!pickupAddress.trim()) { Alert.alert('Address required', 'Please enter a pickup address.'); return; }
    if (!selectedDate) { Alert.alert('Date required', 'Please select a pickup date.'); return; }
    if (!selectedSlot) { Alert.alert('Time required', 'Please select a pickup time slot.'); return; }

    Alert.alert(
      'Confirm Donation & Pickup',
      `Donate ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} to ${selectedCenter.name}.\n\nPickup: ${selectedDate.day} ${selectedDate.date} ${selectedDate.month}, ${selectedSlot}\nFrom: ${pickupAddress}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSubmitting(true);
              const token = await getToken();

              if (!selectedItems || selectedItems.length === 0) {
                Alert.alert('Error', 'No items selected.');
                return;
              }

              const itemsPayload = selectedItems.map(id => ({
                wardrobeItemId: id,
                condition: getBackendCondition(id),
              }));

              const data = await createDonation(token, selectedCenter._id, itemsPayload);
              const earned = data?.data?.totalPointsEarned ?? data?.totalPointsEarned ?? totalPointsToEarn;

              setEarnedPoints(earned);
              setSubmitted(true);
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Donations</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.successScreen}>
          <View style={styles.successIconWrap}>
            <Ionicons name="heart" size={52} color={COLORS.accent} />
          </View>
          <Text style={styles.successTitle}>Thank you! 🎉</Text>
          <Text style={styles.successSub}>
            Your {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} will be picked up and delivered to {selectedCenter?.name}.
          </Text>
          <View style={styles.pickupSummaryCard}>
            <Text style={styles.pickupSummaryTitle}>Pickup Details</Text>
            {[
              { icon: 'location-outline', text: pickupAddress },
              { icon: 'calendar-outline', text: `${selectedDate?.day} ${selectedDate?.date} ${selectedDate?.month}` },
              { icon: 'time-outline', text: selectedSlot },
              { icon: 'storefront-outline', text: selectedCenter?.name },
            ].map((row, i) => (
              <View key={i} style={styles.pickupSummaryRow}>
                <Ionicons name={row.icon} size={15} color={COLORS.accent} />
                <Text style={styles.pickupSummaryText}>{row.text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.pointsEarnedCard}>
            <Text style={styles.pointsEarnedEmoji}>⭐</Text>
            <Text style={styles.pointsEarnedValue}>+{earnedPoints}</Text>
            <Text style={styles.pointsEarnedLabel}>points earned!</Text>
          </View>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Donations</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepWrap}>
        <StepIndicator
          step={step}
          onStepPress={(s) => {
            // Only allow going back, not forward
            if (s >= step) return;
            if (s === 3) setActiveTab('centers');
            setStep(s);
          }}
        />
      </View>

      <View style={styles.pointsBanner}>
        <Text style={styles.pointsBannerEmoji}>⭐</Text>
        <Text style={styles.pointsBannerText}>
          Pristine = 50pts · Good = 30pts · Other = 15pts
        </Text>
      </View>

      {/* Tab row — step 3 only */}
      {step === 3 && (
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.tabActive]}
            onPress={() => setActiveTab('items')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={15} color={activeTab === 'items' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'items' && styles.tabTextActive]}>
              My Items ({selectedItems.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'centers' && styles.tabActive]}
            onPress={() => setActiveTab('centers')}
            activeOpacity={0.8}
          >
            <Ionicons name="location-outline" size={15} color={activeTab === 'centers' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, activeTab === 'centers' && styles.tabTextActive]}>Centers</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── STEP 1: Select items ──────────────────────────────── */}
        {step === 1 && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
            ) : wardrobeItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No wardrobe items</Text>
                <Text style={styles.emptySub}>Add items to your wardrobe first to donate them.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>Select items to donate</Text>
                {wardrobeItems.map(item => {
                  const isSelected = selectedItems.includes(item._id);
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                      onPress={() => toggleItem(item._id)}
                      activeOpacity={0.85}
                    >
                      <ItemImage item={item} style={styles.itemThumb} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>{[item.brand, item.size, item.category].filter(Boolean).join(' · ')}</Text>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* ── STEP 2: Set condition per item ────────────────────── */}
        {step === 2 && (
          <>
            <Text style={styles.sectionLabel}>
              Item Condition — {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.conditionInfoBanner}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} />
              <Text style={styles.conditionInfoText}>
                Be honest about each item's condition — donation centers use this to sort and allocate clothing.
              </Text>
            </View>

            {selectedItems.map(id => {
              const item = wardrobeItems.find(w => w._id === id);
              if (!item) return null;
              const selectedConditionKey = itemConditions[id];

              return (
                <View key={id} style={styles.conditionItemCard}>
                  {/* Item header */}
                  <View style={styles.conditionItemHeader}>
                    <ItemImage item={item} style={styles.conditionItemThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.conditionItemName}>{item.name}</Text>
                      <Text style={styles.conditionItemMeta}>{[item.brand, item.size].filter(Boolean).join(' · ')}</Text>
                    </View>
                    {selectedConditionKey && (
                      <View style={[
                        styles.conditionSelectedBadge,
                        { backgroundColor: getConditionByKey(selectedConditionKey)?.bg },
                      ]}>
                        <Text style={[
                          styles.conditionSelectedBadgeText,
                          { color: getConditionByKey(selectedConditionKey)?.color },
                        ]}>
                          {getConditionByKey(selectedConditionKey)?.icon} {selectedConditionKey}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Condition options */}
                  <View style={styles.conditionOptionsWrap}>
                    {ITEM_CONDITIONS.map(cond => {
                      const isActive = selectedConditionKey === cond.key;
                      return (
                        <TouchableOpacity
                          key={cond.key}
                          style={[
                            styles.conditionOption,
                            isActive && { borderColor: cond.color, backgroundColor: cond.bg },
                          ]}
                          onPress={() => setConditionForItem(id, cond.key)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.conditionOptionIcon}>{cond.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.conditionOptionLabel, isActive && { color: cond.color }]}>
                              {cond.label}
                            </Text>
                            <Text style={styles.conditionOptionDesc}>{cond.description}</Text>
                          </View>
                          {isActive && (
                            <Ionicons name="checkmark-circle" size={20} color={cond.color} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── STEP 3 items tab ──────────────────────────────────── */}
        {step === 3 && activeTab === 'items' && (
          <>
            <Text style={styles.sectionLabel}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </Text>
            {selectedItems.map(id => {
              const item = wardrobeItems.find(w => w._id === id);
              if (!item) return null;
              const condKey = itemConditions[id];
              const condMeta = getConditionByKey(condKey);
              const pts = FRONTEND_POINTS[condKey] ?? 15;
              return (
                <View key={id} style={styles.itemRow}>
                  <ItemImage item={item} style={styles.itemThumb} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{[item.brand, item.size].filter(Boolean).join(' · ')}</Text>
                    {condMeta && (
                      <View style={styles.itemTagRow}>
                        <View style={[styles.conditionTag, { backgroundColor: condMeta.bg }]}>
                          <Text style={[styles.conditionText, { color: condMeta.color }]}>
                            {condMeta.icon} {condMeta.label}
                          </Text>
                        </View>
                        <View style={styles.pointsTag}>
                          <Text style={styles.pointsTagText}>+{pts} pts</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── STEP 3 centers tab ───────────────────────────────── */}
        {step === 3 && activeTab === 'centers' && (
          <>
            <View style={styles.pickCenterPrompt}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.accent} />
              <Text style={styles.pickCenterPromptText}>
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} ready. Now pick a donation center.
              </Text>
            </View>
            {centersLoading ? (
              <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
            ) : centers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={40} color={COLORS.accent} />
                <Text style={styles.emptyTitle}>No centers found</Text>
                <Text style={styles.emptySub}>No donation centers found near your location.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchCenters} activeOpacity={0.85}>
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>{centers.length} center{centers.length !== 1 ? 's' : ''} near you</Text>
                {centers.map(center => (
                  <TouchableOpacity
                    key={center._id}
                    style={styles.centerCard}
                    onPress={() => handleSelectCenter(center)}
                    activeOpacity={0.88}
                  >
                    <View style={styles.centerHeader}>
                      <View style={styles.centerIconWrap}>
                        <Ionicons name="location" size={20} color={COLORS.accent} />
                      </View>
                      <View style={styles.centerInfo}>
                        <View style={styles.centerTitleRow}>
                          <Text style={styles.centerName}>{center.name}</Text>
                          {center.isVerified && (
                            <View style={styles.verifiedBadge}>
                              <Ionicons name="shield-checkmark" size={10} color={COLORS.white} />
                              <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.centerAddress}>{center.address}, {center.city}</Text>
                      </View>
                    </View>
                    {(center.hours || center.phone) && (
                      <View style={styles.centerDetails}>
                        {center.hours && (
                          <View style={styles.centerDetailRow}>
                            <Ionicons name="time-outline" size={13} color={COLORS.muted} />
                            <Text style={styles.centerDetailText}>{center.hours}</Text>
                          </View>
                        )}
                        {center.phone && (
                          <View style={styles.centerDetailRow}>
                            <Ionicons name="call-outline" size={13} color={COLORS.muted} />
                            <Text style={styles.centerDetailText}>{center.phone}</Text>
                          </View>
                        )}
                      </View>
                    )}
                    {center.acceptedItems?.length > 0 && (
                      <View style={styles.acceptsRow}>
                        {center.acceptedItems.map(a => (
                          <View key={a} style={styles.acceptTag}>
                            <Text style={styles.acceptTagText}>{a}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={styles.selectCenterBtn}>
                      <Ionicons name="navigate-outline" size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                      <Text style={styles.selectCenterBtnText}>Select This Center</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {/* ── STEP 4: Pickup scheduling ─────────────────────────── */}
        {step === 4 && (
          <>
            <View style={styles.centerSelectedBanner}>
              <Ionicons name="location" size={16} color={COLORS.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.centerSelectedLabel}>Donating to</Text>
                <Text style={styles.centerSelectedName}>{selectedCenter?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => { setStep(3); setActiveTab('centers'); }} activeOpacity={0.8}>
                <Text style={styles.changeCenter}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Pickup Address</Text>

            {savedAddresses.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.savedAddressToggle}
                  onPress={() => setShowAddresses(v => !v)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bookmark-outline" size={15} color={COLORS.accent} />
                  <Text style={styles.savedAddressToggleText}>Use a saved address</Text>
                  <Ionicons name={showAddresses ? 'chevron-up' : 'chevron-down'} size={15} color={COLORS.muted} />
                </TouchableOpacity>
                {showAddresses && (
                  <View style={styles.savedAddressList}>
                    {savedAddresses.map((addr, i) => (
                      <TouchableOpacity
                        key={addr._id ?? i}
                        style={[styles.savedAddressItem, pickupAddress === formatAddress(addr) && styles.savedAddressItemActive]}
                        onPress={() => { setPickupAddress(formatAddress(addr)); setShowAddresses(false); }}
                        activeOpacity={0.85}
                      >
                        <View style={{ flex: 1 }}>
                          {addr.label && <Text style={styles.savedAddressLabel}>{addr.label}</Text>}
                          <Text style={styles.savedAddressText}>{formatAddress(addr)}</Text>
                        </View>
                        {pickupAddress === formatAddress(addr) && (
                          <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <TextInput
              style={styles.addressInput}
              placeholder="Enter pickup address..."
              placeholderTextColor={COLORS.muted}
              value={pickupAddress}
              onChangeText={setPickupAddress}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Pickup Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
              {DATES.map(d => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.dateCard, selectedDate?.key === d.key && styles.dateCardActive]}
                  onPress={() => setSelectedDate(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDayText, selectedDate?.key === d.key && styles.dateTextActive]}>{d.day}</Text>
                  <Text style={[styles.dateDateText, selectedDate?.key === d.key && styles.dateTextActive]}>{d.date}</Text>
                  <Text style={[styles.dateMonthText, selectedDate?.key === d.key && styles.dateTextActive]}>{d.month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Pickup Time</Text>
            {TIME_SLOTS.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[styles.timeSlot, selectedSlot === slot && styles.timeSlotActive]}
                onPress={() => setSelectedSlot(slot)}
                activeOpacity={0.85}
              >
                <Ionicons name="time-outline" size={16} color={selectedSlot === slot ? COLORS.white : COLORS.accent} style={{ marginRight: 10 }} />
                <Text style={[styles.timeSlotText, selectedSlot === slot && styles.timeSlotTextActive]}>{slot}</Text>
                {selectedSlot === slot && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.white} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Donation Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Drop-off center</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{selectedCenter?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Points to earn</Text>
                <Text style={[styles.summaryValue, { color: COLORS.gold }]}>⭐ +{totalPointsToEarn}</Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom CTA ─────────────────────────────────────────── */}
      <View style={styles.ctaBar}>
        {step === 1 && (
          <TouchableOpacity
            style={[styles.ctaBtn, selectedItems.length === 0 && styles.ctaBtnDisabled]}
            onPress={handleProceedToCondition}
            disabled={selectedItems.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>
              {selectedItems.length === 0
                ? 'Select items to continue'
                : `Continue with ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} →`}
            </Text>
          </TouchableOpacity>
        )}

        {step === 2 && (
          <TouchableOpacity
            style={[styles.ctaBtn, !allConditionsSet && styles.ctaBtnDisabled]}
            onPress={handleProceedToCenter}
            disabled={!allConditionsSet}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.ctaBtnText}>
              {allConditionsSet ? 'Pick a Donation Center →' : 'Set condition for all items'}
            </Text>
          </TouchableOpacity>
        )}

        {step === 3 && activeTab === 'items' && (
          <TouchableOpacity style={styles.ctaBtn} onPress={() => setActiveTab('centers')} activeOpacity={0.85}>
            <Ionicons name="location-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.ctaBtnText}>Pick a Donation Center</Text>
          </TouchableOpacity>
        )}

        {step === 4 && (
          <TouchableOpacity
            style={[styles.ctaBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
              : <Ionicons name="car-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            }
            <Text style={styles.ctaBtnText}>
              {submitting ? 'Scheduling Pickup...' : 'Schedule Pickup & Donate'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#C17C74' },

  stepWrap: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border },
  stepCircleActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  stepNum: { fontSize: 11, fontWeight: '700', color: COLORS.muted },
  stepNumActive: { color: COLORS.white },
  stepLabel: { fontSize: 9, fontWeight: '600', color: COLORS.muted },
  stepLabelActive: { color: COLORS.accent },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 14 },
  stepLineActive: { backgroundColor: COLORS.accent },

  pointsBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.goldLight, marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsBannerEmoji: { fontSize: 16 },
  pointsBannerText: { flex: 1, fontSize: 11, fontWeight: '600', color: '#7a5c00' },

  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.accent },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  tabTextActive: { color: COLORS.white },

  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 12 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  emptySub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  retryBtn: { marginTop: 6, backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  itemRowSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  itemThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.card },
  emojiFallback: { alignItems: 'center', justifyContent: 'center' },
  emojiFallbackText: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  itemMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  itemTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  conditionTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  conditionText: { fontSize: 10, fontWeight: '700' },
  pointsTag: { backgroundColor: COLORS.goldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  pointsTagText: { fontSize: 10, fontWeight: '700', color: COLORS.gold },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },

  // ── Step 2 condition styles ──────────────────────────────────────
  conditionInfoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.accentLight, borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  conditionInfoText: { flex: 1, fontSize: 12, color: COLORS.accent, lineHeight: 18 },

  conditionItemCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  conditionItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  conditionItemThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: COLORS.card },
  conditionItemName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  conditionItemMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  conditionSelectedBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  conditionSelectedBadgeText: { fontSize: 11, fontWeight: '700' },

  conditionOptionsWrap: { gap: 8 },
  conditionOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bg, borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  conditionOptionIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  conditionOptionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  conditionOptionDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2 },

  centerSelectedBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  centerSelectedLabel: { fontSize: 10, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase' },
  centerSelectedName: { fontSize: 14, fontWeight: '700', color: COLORS.accent, marginTop: 2 },
  changeCenter: { fontSize: 12, fontWeight: '700', color: COLORS.accent },

  pickCenterPrompt: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  pickCenterPromptText: { flex: 1, fontSize: 13, color: COLORS.accent, fontWeight: '600', lineHeight: 19 },

  centerCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  centerHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  centerIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
  centerInfo: { flex: 1 },
  centerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  centerName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.accent, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 },
  verifiedText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
  centerAddress: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  centerDetails: { gap: 6, marginBottom: 12 },
  centerDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  centerDetailText: { fontSize: 12, color: COLORS.muted },
  acceptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  acceptTag: { backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  acceptTagText: { fontSize: 11, fontWeight: '600', color: COLORS.accent },
  selectCenterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 12 },
  selectCenterBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  savedAddressToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  savedAddressToggleText: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.accent },
  savedAddressList: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  savedAddressItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  savedAddressItemActive: { backgroundColor: COLORS.accentLight },
  savedAddressLabel: { fontSize: 11, fontWeight: '700', color: COLORS.accent, marginBottom: 2 },
  savedAddressText: { fontSize: 13, color: COLORS.text },
  addressInput: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 70 },

  datesRow: { gap: 10, paddingVertical: 4 },
  dateCard: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: COLORS.border, minWidth: 64 },
  dateCardActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  dateDayText: { fontSize: 11, fontWeight: '600', color: COLORS.muted },
  dateDateText: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginVertical: 2 },
  dateMonthText: { fontSize: 11, color: COLORS.muted },
  dateTextActive: { color: COLORS.white },

  timeSlot: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.border },
  timeSlotActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  timeSlotText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timeSlotTextActive: { color: COLORS.white },

  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.muted },
  summaryValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },

  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15 },
  ctaBtnDisabled: { backgroundColor: COLORS.card },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  successScreen: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 40, paddingBottom: 60 },
  successIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.accentLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  successSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  pickupSummaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  pickupSummaryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  pickupSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickupSummaryText: { fontSize: 13, color: COLORS.text, flex: 1 },
  pointsEarnedCard: { alignItems: 'center', backgroundColor: COLORS.goldLight, borderRadius: 20, padding: 24, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: '#f9e0a0' },
  pointsEarnedEmoji: { fontSize: 36, marginBottom: 6 },
  pointsEarnedValue: { fontSize: 48, fontWeight: '900', color: COLORS.gold },
  pointsEarnedLabel: { fontSize: 16, fontWeight: '700', color: '#7a5c00', marginTop: 4 },
  doneBtn: { backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  stepCircleClickable: {
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});