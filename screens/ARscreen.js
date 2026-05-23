import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  NativeModules,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getWardrobeItems, getCollectionItems } from '../services/authService';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const INSTRUCTIONS = [
  { icon: '👕', text: 'Pick a garment from the carousel below' },
  { icon: '📱', text: 'Point your camera at your body' },
  { icon: '✋', text: 'Drag the garment to position it on you' },
  { icon: '🔍', text: 'Use Size and Opacity controls to fine-tune' },
];

const WEARABLE_CATEGORIES = [
  'tops', 'bottoms', 'dresses', 'outerwear',
  'shoes', 'swimwear', 'activewear', 'suits',
];

// ---------------------------------------------------------------------------
// LazyViroNavigator
// ---------------------------------------------------------------------------
const LazyViroNavigator = React.memo(function LazyViroNavigator({ garmentUri, opacity, scale }) {
  const { ViroARSceneNavigator } = require('@reactvision/react-viro');
  const ARtryonscene = require('./ARtryonscene').default;

  return (
    <ViroARSceneNavigator
      style={StyleSheet.absoluteFill}
      initialScene={{ scene: ARtryonscene }}
      viroAppProps={{ garmentUri, opacity, scale }}
      autofocus
    />
  );
});

// ---------------------------------------------------------------------------
// GarmentCard
// ---------------------------------------------------------------------------
function GarmentCard({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.garmentCard, isSelected && styles.garmentCardSelected]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.garmentImage}
        resizeMode="cover"
      />

      <Text style={styles.garmentName} numberOfLines={1}>
        {item.name}
      </Text>

      {item.type === 'collection' && (
        <View style={styles.collectionBadge}>
          <Text style={styles.collectionBadgeText}>FASH</Text>
        </View>
      )}

      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// SimulatorFallback
// ---------------------------------------------------------------------------
function SimulatorFallback({ garment }) {
  return (
    <View style={styles.simulatorFallback}>

      {/* Mannequin */}
      <View style={styles.mannequin}>
        {/* Head */}
        <View style={styles.mannequinHead} />

        {/* Shoulders + torso row */}
        <View style={styles.mannequinShoulderRow}>
          <View style={styles.mannequinArm} />

          <View style={styles.mannequinTorso}>
            {garment?.imageUrl ? (
              <Image
                source={{ uri: garment.imageUrl }}
                style={styles.mannequinGarment}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.mannequinPlaceholder}>👕</Text>
            )}
          </View>

          <View style={styles.mannequinArm} />
        </View>

        {/* Legs */}
        <View style={styles.mannequinLegRow}>
          <View style={styles.mannequinLeg} />
          <View style={[styles.mannequinLeg, { marginLeft: 8 }]} />
        </View>
      </View>

      {/* Badge — anchored inside the fallback, above the white panel */}
      <View style={styles.simulatorBadge}>
        <Text style={styles.simulatorBadgeText}>
          📱 Simulator preview
        </Text>
        <Text style={styles.simulatorBadgeSub}>
          Live AR camera requires a physical device + dev build
        </Text>
      </View>

    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function ARscreen({ navigation, route }) {
  const { getToken } = useAuth();

  const passedItems = route?.params?.garmentItems ?? [];
  const initialItem = route?.params?.selectedItem ?? null;

  const [garmentItems, setGarmentItems]     = useState([]);
  const [loadingGarments, setLoadingGarments] = useState(true);
  const [selectedGarment, setSelectedGarment] = useState(initialItem ?? null);
  const [opacity, setOpacity]               = useState(0.9);
  const [scale, setScale]                   = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);

  const instructionFade = useRef(new Animated.Value(1)).current;

  // ── Fetch garments ────────────────────────────────────────────────
  useEffect(() => {
    const fetchGarments = async () => {
      try {
        setLoadingGarments(true);

        if (passedItems.length > 0) {
          setGarmentItems(passedItems);
          return;
        }

        const token = await getToken();

        const [wardrobeRes, collectionRes] = await Promise.all([
          getWardrobeItems(token),
          getCollectionItems(),
        ]);

        const wardrobeItems = (wardrobeRes.items ?? wardrobeRes ?? [])
          .filter(item =>
            !item.category ||
            WEARABLE_CATEGORIES.includes(item.category?.toLowerCase())
          )
          .map(item => ({
            id: item._id,
            name: item.name,
            imageUrl: item.image,
            type: 'wardrobe',
          }));

        const collectionItems = (collectionRes.items ?? collectionRes ?? [])
          .filter(item =>
            !item.category ||
            WEARABLE_CATEGORIES.includes(item.category?.toLowerCase())
          )
          .map(item => ({
            id: item._id,
            name: item.title,
            imageUrl: item.image,
            type: 'collection',
          }));

        const mergedItems = [...wardrobeItems, ...collectionItems]
          .filter(item => item.imageUrl);

        if (mergedItems.length === 0) {
          console.warn('No wearable garments found for AR Try-On');
        }

        setGarmentItems(mergedItems);

      } catch (err) {
        console.error('Error loading garments:', err.message);
      } finally {
        setLoadingGarments(false);
      }
    };

    fetchGarments();
  }, []);

  // ── Auto-select first garment ─────────────────────────────────────
  useEffect(() => {
    if (!selectedGarment && garmentItems.length > 0) {
      setSelectedGarment(garmentItems[0]);
    }
  }, [garmentItems]);

  // ── Instructions auto-fade ────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(instructionFade, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => setShowInstructions(false));
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const dismissInstructions = () =>
    Animated.timing(instructionFade, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowInstructions(false));

  const reopenInstructions = () => {
    setShowInstructions(true);
    instructionFade.setValue(1);
  };

  const handleSelectGarment = useCallback((item) => setSelectedGarment(item), []);

  const adjustOpacity = (delta) =>
    setOpacity(prev =>
      Math.min(1, Math.max(0.1, parseFloat((prev + delta).toFixed(1))))
    );

  const adjustScale = (delta) =>
    setScale(prev =>
      Math.min(2.5, Math.max(0.3, parseFloat((prev + delta).toFixed(1))))
    );

  const useFallback = !NativeModules.VRTMaterialManager;

  // ── Loading ───────────────────────────────────────────────────────
  if (loadingGarments) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C17C74" />
        <Text style={styles.loadingText}>Loading garments...</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {useFallback ? (
        <SimulatorFallback garment={selectedGarment} />
      ) : (
        <LazyViroNavigator
          garmentUri={selectedGarment?.imageUrl}
          opacity={opacity}
          scale={scale}
        />
      )}

      {/* Instructions overlay */}
      {showInstructions && (
        <Animated.View
          style={[styles.instructionsOverlay, { opacity: instructionFade }]}
        >
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to use AR Try-On</Text>

            {INSTRUCTIONS.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <Text style={styles.instructionIcon}>{step.icon}</Text>
                <Text style={styles.instructionText}>{step.text}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.instructionsDismiss}
              onPress={dismissInstructions}
            >
              <Text style={styles.instructionsDismissText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Top Bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>AR Try-On</Text>

        <TouchableOpacity style={styles.iconButton} onPress={reopenInstructions}>
          <Text style={styles.iconButtonText}>?</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>

        {/* Opacity + Size controls */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>OPACITY</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity style={styles.controlBtn} onPress={() => adjustOpacity(-0.1)}>
                <Text style={styles.controlBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{Math.round(opacity * 100)}%</Text>
              <TouchableOpacity style={styles.controlBtn} onPress={() => adjustOpacity(0.1)}>
                <Text style={styles.controlBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlDivider} />

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>SIZE</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity style={styles.controlBtn} onPress={() => adjustScale(-0.1)}>
                <Text style={styles.controlBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{Math.round(scale * 100)}%</Text>
              <TouchableOpacity style={styles.controlBtn} onPress={() => adjustScale(0.1)}>
                <Text style={styles.controlBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carousel label */}
        <Text style={styles.carouselLabel}>
          Select garment{' '}
          <Text style={styles.carouselSelected}>{selectedGarment?.name}</Text>
        </Text>

        {/* Carousel */}
        <FlatList
          data={garmentItems}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          renderItem={({ item }) => (
            <GarmentCard
              item={item}
              isSelected={selectedGarment?.id === item.id}
              onPress={handleSelectGarment}
            />
          )}
        />

      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const C = {
  rose:    '#C17C74',
  dark:    '#2C1F1F',
  beige:   '#F2E6E3',
  light:   '#F5F5F5',
  white:   '#FFFFFF',
  overlay: 'rgba(44,31,31,0.55)',
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 12,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  screenTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 34,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  controlGroup: {
    alignItems: 'center',
    flex: 1,
  },
  controlLabel: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    marginBottom: 6,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: {
    fontSize: 20,
    color: C.dark,
  },
  controlValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.dark,
    minWidth: 44,
    textAlign: 'center',
  },
  controlDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.beige,
    marginHorizontal: 8,
  },
  carouselLabel: {
    fontSize: 13,
    color: '#999',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  carouselSelected: {
    color: C.rose,
    fontWeight: '600',
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  garmentCard: {
    width: 85,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: C.light,
  },
  garmentCardSelected: {
    borderColor: C.rose,
  },
  garmentImage: {
    width: 85,
    height: 110,
  },
  garmentName: {
    fontSize: 10,
    color: C.dark,
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  collectionBadge: {
    position: 'absolute',
    bottom: 28,
    left: 6,
    backgroundColor: '#C17C74',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  collectionBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '700',
  },
  simulatorFallback: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatorBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  simulatorHead: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#444',
    marginBottom: 8,
  },
  simulatorTorso: {
    width: 160,
    height: 210,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatorGarment: {
    width: 150,
    height: 200,
  },
  mannequin: {
    alignItems: 'center',
    marginBottom: 120, // leave room for badge above white panel
  },
  mannequinHead: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3a3a3a',
    marginBottom: 6,
  },
  mannequinShoulderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mannequinArm: {
    width: 22,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 10,
    marginTop: 10,
  },
  mannequinTorso: {
    width: 140,
    height: 160,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  mannequinGarment: {
    width: 130,
    height: 150,
  },
  mannequinPlaceholder: {
    fontSize: 48,
  },
  mannequinLegRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  mannequinLeg: {
    width: 40,
    height: 90,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  simulatorBadge: {
    position: 'absolute',
    bottom: 20, // relative to simulatorFallback, which ends where white panel begins
    left: 20,
    right: 20,
    backgroundColor: 'rgba(193,124,116,0.12)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.rose,
    alignItems: 'center',
  },
  simulatorBadgeText: {
    color: C.rose,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  simulatorBadgeSub: {
    color: '#aaa',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  instructionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: C.dark,
    flex: 1,
    lineHeight: 20,
  },
  instructionsDismiss: {
    marginTop: 20,
    backgroundColor: C.rose,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  instructionsDismissText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  
});