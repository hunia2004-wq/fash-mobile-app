import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  NativeModules,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ViroReact is NOT imported at the top level.
// Top-level imports of @reactvision/react-viro crash in Expo Go because the
// native modules (VRTMaterialManager, VRTAnimationManager) do not exist there.
// LazyViroNavigator below uses require() so the module only loads when we
// have confirmed the native modules are present.

const INSTRUCTIONS = [
  { icon: '👕', text: 'Pick a garment from the carousel below' },
  { icon: '📱', text: 'Point your camera at your body' },
  { icon: '✋', text: 'Drag the garment to position it on you' },
  { icon: '🔍', text: 'Use Size and Opacity controls to fine-tune' },
];

// ---------------------------------------------------------------------------
// LazyViroNavigator — only mounted when native modules are confirmed present
// ---------------------------------------------------------------------------
function LazyViroNavigator({ garmentUri, opacity, scale }) {
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
}

// ---------------------------------------------------------------------------
// GarmentCard
// ---------------------------------------------------------------------------
function GarmentCard({ item, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.garmentCard, isSelected && styles.garmentCardSelected]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.garmentImage}
        resizeMode="cover"
      />
      <Text style={styles.garmentName} numberOfLines={1}>
        {item.name}
      </Text>
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// SimulatorFallback — shown when ViroReact native modules are absent
// ---------------------------------------------------------------------------
function SimulatorFallback({ garment }) {
  return (
    <View style={styles.simulatorFallback}>
      <View style={styles.simulatorBody}>
        <View style={styles.simulatorHead} />
        <View style={styles.simulatorTorso}>
          {garment?.imageUrl ? (
            <Image
              source={{ uri: garment.imageUrl }}
              style={styles.simulatorGarment}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </View>
      <View style={styles.simulatorBadge}>
        <Text style={styles.simulatorBadgeText}>Simulator / Expo Go preview</Text>
        <Text style={styles.simulatorBadgeSub}>
          AR camera requires a physical device + development build
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ARscreen — registered in App.js as "ARscreen"
// ---------------------------------------------------------------------------
export default function ARscreen({ navigation, route }) {
  const passedItems = route?.params?.garmentItems ?? [];
  const initialItem = route?.params?.selectedItem ?? null;

  const garmentItems =
    passedItems.length > 0
      ? passedItems
      : [
          { id: '1', name: 'White Shirt', imageUrl: 'https://picsum.photos/seed/shirt1/200/300' },
          { id: '2', name: 'Black Dress', imageUrl: 'https://picsum.photos/seed/dress1/200/300' },
          { id: '3', name: 'Blue Blazer', imageUrl: 'https://picsum.photos/seed/blazer1/200/300' },
          { id: '4', name: 'Floral Top',  imageUrl: 'https://picsum.photos/seed/top1/200/300'   },
        ];

  const [selectedGarment, setSelectedGarment] = useState(initialItem ?? garmentItems[0]);
  const [opacity, setOpacity]                 = useState(0.9);
  const [scale, setScale]                     = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const instructionFade = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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
    Animated.timing(instructionFade, { toValue: 0, duration: 300, useNativeDriver: true })
      .start(() => setShowInstructions(false));

  const reopenInstructions = () => {
    setShowInstructions(true);
    instructionFade.setValue(1);
  };

  const handleSelectGarment = useCallback((item) => setSelectedGarment(item), []);

  const adjustOpacity = (d) =>
    setOpacity((p) => Math.min(1, Math.max(0.1, parseFloat((p + d).toFixed(1)))));

  const adjustScale = (d) =>
    setScale((p) => Math.min(2.5, Math.max(0.3, parseFloat((p + d).toFixed(1)))));

  // Check whether ViroReact native modules loaded.
  // VRTMaterialManager is the first module Viro registers; if it is absent
  // we are in Expo Go or a simulator and must show the fallback.
  const useFallback = !NativeModules.VRTMaterialManager;

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

      {showInstructions && (
        <Animated.View
          style={[styles.instructionsOverlay, { opacity: instructionFade }]}
          pointerEvents="box-none"
        >
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>How to use AR Try-On</Text>
            {INSTRUCTIONS.map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <Text style={styles.instructionIcon}>{step.icon}</Text>
                <Text style={styles.instructionText}>{step.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.instructionsDismiss} onPress={dismissInstructions}>
              <Text style={styles.instructionsDismissText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>AR Try-On</Text>
        <TouchableOpacity style={styles.iconButton} onPress={reopenInstructions}>
          <Text style={styles.iconButtonText}>?</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.bottomPanel}>
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

        <Text style={styles.carouselLabel}>
          Select garment{' '}
          <Text style={styles.carouselSelected}>{selectedGarment?.name}</Text>
        </Text>

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
// Styles
// ---------------------------------------------------------------------------
const C = {
  rose:    '#C17C74',
  dark:    '#2C1F1F',
  beige:   '#F2E6E3',
  light:   '#F5F5F5',
  white:   '#FFFFFF',
  overlay: 'rgba(44,31,31,0.55)',
};

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#000' },
  topBar:             { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  iconButton:         { width: 36, height: 36, borderRadius: 18, backgroundColor: C.overlay, alignItems: 'center', justifyContent: 'center' },
  iconButtonText:     { color: C.white, fontSize: 17, fontWeight: '700' },
  screenTitle:        { color: C.white, fontSize: 17, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  instructionsOverlay:{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  instructionsCard:   { backgroundColor: C.white, borderRadius: 20, padding: 24, marginHorizontal: 32, alignItems: 'center' },
  instructionsTitle:  { fontSize: 18, fontWeight: '700', color: C.dark, marginBottom: 20 },
  instructionRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14, width: '100%' },
  instructionIcon:    { fontSize: 22, marginRight: 12 },
  instructionText:    { fontSize: 14, color: C.dark, flex: 1, lineHeight: 20 },
  instructionsDismiss:{ marginTop: 20, backgroundColor: C.rose, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  instructionsDismissText: { color: C.white, fontSize: 15, fontWeight: '600' },
  bottomPanel:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingBottom: 34, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 12 },
  controlsRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginBottom: 16 },
  controlGroup:       { alignItems: 'center', flex: 1 },
  controlLabel:       { fontSize: 10, color: '#999', letterSpacing: 1, marginBottom: 6 },
  controlButtons:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: C.beige, alignItems: 'center', justifyContent: 'center' },
  controlBtnText:     { fontSize: 20, color: C.dark, fontWeight: '400', lineHeight: 22 },
  controlValue:       { fontSize: 15, fontWeight: '600', color: C.dark, minWidth: 44, textAlign: 'center' },
  controlDivider:     { width: 1, height: 36, backgroundColor: C.beige, marginHorizontal: 8 },
  carouselLabel:      { fontSize: 13, color: '#999', paddingHorizontal: 20, marginBottom: 10 },
  carouselSelected:   { color: C.rose, fontWeight: '600' },
  carouselContent:    { paddingHorizontal: 16, gap: 10 },
  garmentCard:        { width: 80, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: C.light },
  garmentCardSelected:{ borderColor: C.rose },
  garmentImage:       { width: 80, height: 100 },
  garmentName:        { fontSize: 10, color: C.dark, textAlign: 'center', paddingVertical: 4, paddingHorizontal: 4 },
  selectedBadge:      { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
  selectedBadgeText:  { color: C.white, fontSize: 11, fontWeight: '700' },
  simulatorFallback:  { flex: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  simulatorBody:      { alignItems: 'center', marginBottom: 24 },
  simulatorHead:      { width: 64, height: 64, borderRadius: 32, backgroundColor: '#444', marginBottom: 8 },
  simulatorTorso:     { width: 160, height: 210, backgroundColor: '#2a2a2a', borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  simulatorGarment:   { width: 150, height: 200 },
  simulatorBadge:     { position: 'absolute', bottom: 240, left: 20, right: 20, backgroundColor: 'rgba(193,124,116,0.12)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.rose, alignItems: 'center' },
  simulatorBadgeText: { color: C.rose, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  simulatorBadgeSub:  { color: '#aaa', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});