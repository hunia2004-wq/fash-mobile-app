import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Ellipse, Rect, Line, Circle } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  primary: '#C17C74',
  card:    '#F2E6E3',
  bg:      '#F5F5F5',
  dark:    '#2C1F1F',
  white:   '#ffffff',
  panelBg: 'rgba(20,15,15,0.92)',
  iconBtn: 'rgba(255,255,255,0.15)',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = ['Clothing', 'Accessories', 'Shoes'];

const ITEMS = {
  Clothing: [
    { id: 'c1', color: '#C17C74', label: 'Rose Blouse',    fitScore: 94 },
    { id: 'c2', color: '#5DCAA5', label: 'Teal Top',       fitScore: 88 },
    { id: 'c3', color: '#7F77DD', label: 'Lavender Dress', fitScore: 91 },
    { id: 'c4', color: '#EF9F27', label: 'Amber Jacket',   fitScore: 86 },
    { id: 'c5', color: '#ED93B1', label: 'Pink Cardigan',  fitScore: 95 },
  ],
  Accessories: [
    { id: 'a1', color: '#C17C74', label: 'Rose Bag',       fitScore: 99 },
    { id: 'a2', color: '#7F77DD', label: 'Lavender Scarf', fitScore: 99 },
    { id: 'a3', color: '#EF9F27', label: 'Amber Glasses',  fitScore: 99 },
  ],
  Shoes: [
    { id: 's1', color: '#5c3d3d', label: 'Boots',    fitScore: 90 },
    { id: 's2', color: '#3d5c4a', label: 'Sneakers', fitScore: 87 },
    { id: 's3', color: '#3d4a5c', label: 'Heels',    fitScore: 92 },
  ],
};

// ─── Clothing Overlay SVG ─────────────────────────────────────────────────────
const ClothingOverlay = ({ item, category }) => {
  const cx    = SCREEN_W / 2;
  const headY = SCREEN_H * 0.22;
  const col   = item?.color || C.primary;

  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {/* Head */}
      <Ellipse cx={cx} cy={headY} rx={32} ry={36} fill="#2a2a3e" opacity={0.6} />

      {/* Clothing */}
      {category === 'Clothing' && (
        <>
          <Rect x={cx - 52} y={headY + 36}  width={104} height={110} rx={10} fill={col} opacity={0.85} />
          <Line x1={cx}      y1={headY + 36}  x2={cx}      y2={headY + 146} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <Line x1={cx - 52} y1={headY + 55}  x2={cx - 88} y2={headY + 120} stroke={col} strokeWidth={22} strokeLinecap="round" />
          <Line x1={cx + 52} y1={headY + 55}  x2={cx + 88} y2={headY + 120} stroke={col} strokeWidth={22} strokeLinecap="round" />
          <Rect x={cx - 48}  y={headY + 143} width={42}  height={130} rx={8} fill="#8B6F6A" opacity={0.8} />
          <Rect x={cx + 6}   y={headY + 143} width={42}  height={130} rx={8} fill="#8B6F6A" opacity={0.8} />
        </>
      )}

      {/* Accessories */}
      {category === 'Accessories' && (
        <Circle cx={cx} cy={headY + 52} r={22} stroke={col} strokeWidth={5} fill="none" opacity={0.9} />
      )}

      {/* Shoes */}
      {category === 'Shoes' && (
        <>
          <Rect x={cx - 48} y={headY + 143} width={42} height={130} rx={8} fill="#2a2a3e" opacity={0.6} />
          <Rect x={cx + 6}  y={headY + 143} width={42} height={130} rx={8} fill="#2a2a3e" opacity={0.6} />
          <Rect x={cx - 54} y={headY + 270} width={50} height={26}  rx={8} fill={col} opacity={0.9} />
          <Rect x={cx + 4}  y={headY + 270} width={50} height={26}  rx={8} fill={col} opacity={0.9} />
        </>
      )}
    </Svg>
  );
};

// ─── Animated Scan Line ───────────────────────────────────────────────────────
const ScanLine = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [SCREEN_H * 0.15, SCREEN_H * 0.75],
  });

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
      pointerEvents="none"
    />
  );
};

// ─── Corner Brackets ──────────────────────────────────────────────────────────
const Brackets = () => (
  <>
    <View style={[styles.corner, styles.cornerTL]} />
    <View style={[styles.corner, styles.cornerTR]} />
    <View style={[styles.corner, styles.cornerBL]} />
    <View style={[styles.corner, styles.cornerBR]} />
  </>
);

// ─── Item Thumbnail ───────────────────────────────────────────────────────────
const ItemThumb = ({ item, active, onPress, category }) => (
  <TouchableOpacity
    style={[styles.itemThumb, { backgroundColor: item.color + '33' }, active && styles.itemThumbActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Svg width={30} height={34} viewBox="0 0 30 34">
      {category === 'Clothing' && (
        <>
          <Rect x={4} y={8} width={22} height={22} rx={3} fill={item.color} opacity={0.9} />
          <Line x1={15} y1={8}  x2={15} y2={30} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Line x1={4}  y1={14} x2={1}  y2={22} stroke={item.color} strokeWidth={4} strokeLinecap="round" />
          <Line x1={26} y1={14} x2={29} y2={22} stroke={item.color} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {category === 'Accessories' && (
        <>
          <Circle cx={15} cy={18} r={10} stroke={item.color} strokeWidth={4} fill="none" opacity={0.9} />
          <Rect x={9} y={7} width={12} height={5} rx={2} fill={item.color} opacity={0.6} />
        </>
      )}
      {category === 'Shoes' && (
        <>
          <Ellipse cx={15} cy={22} rx={11} ry={7} fill={item.color} opacity={0.9} />
          <Rect x={8} y={14} width={14} height={10} rx={3} fill={item.color} opacity={0.7} />
        </>
      )}
    </Svg>
    {active && (
      <View style={styles.itemCheck}>
        <Ionicons name="checkmark" size={9} color="#fff" />
      </View>
    )}
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ARTryOnScreen({ navigation }) {
  const [permission, setPermission]           = useState(null);
  const [mediaPermission, setMediaPermission] = useState(null);
  const [activeCategory, setActiveCategory]   = useState('Clothing');
  const [selectedItem, setSelectedItem]       = useState(ITEMS['Clothing'][0]);
  const [facing, setFacing]                   = useState('front');
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cam   = await Camera.requestCameraPermissionsAsync();
      setPermission(cam.status === 'granted');

      const media = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(media.status === 'granted');
    })();
  }, []);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSelectedItem(ITEMS[cat][0]);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (mediaPermission) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        Alert.alert('Saved!', 'Your look has been saved to your camera roll.');
      } else {
        Alert.alert('No permission', 'Grant photo library access to save looks.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not capture photo.');
    }
  };

  // ── Loading ──
  if (permission === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.mutedText}>Loading…</Text>
      </View>
    );
  }

  // ── Permission denied ──
  if (permission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={48} color={C.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          FASH needs camera access to show you how items look on you.
          Please enable it in your device settings.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={() => Linking.openSettings()}>
          <Text style={styles.permBtnText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permBtn, styles.permBtnOutline]}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setPermission(status === 'granted');
          }}
        >
          <Text style={styles.permBtnOutlineText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main UI ──
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Live camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      {/* AR overlay */}
      <ClothingOverlay item={selectedItem} category={activeCategory} />

      {/* Scan line */}
      <ScanLine />

      {/* Corner brackets */}
      <Brackets />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>AR Try-On</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
        >
          <Ionicons name="camera-reverse-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Body detected badge */}
      <View style={styles.detectBadge} pointerEvents="none">
        <View style={styles.pulseDot} />
        <Text style={styles.detectText}>Body detected</Text>
      </View>

      {/* Fit score */}
      <View style={styles.fitBadge} pointerEvents="none">
        <Text style={styles.fitLabel}>Fit score</Text>
        <Text style={styles.fitScore}>{selectedItem?.fitScore ?? '—'}%</Text>
      </View>

      {/* Item label */}
      <View style={styles.itemLabel} pointerEvents="none">
        <Text style={styles.itemLabelText}>{selectedItem?.label}</Text>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>

        {/* Category tabs */}
        <View style={styles.tabRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.tabActive]}
              onPress={() => handleCategoryChange(cat)}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Item carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {ITEMS[activeCategory].map((item) => (
            <ItemThumb
              key={item.id}
              item={item}
              category={activeCategory}
              active={selectedItem?.id === item.id}
              onPress={() => setSelectedItem(item)}
            />
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={handleCapture}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.captureBtnText}>Capture look</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // Permission screen
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, padding: 32 },
  mutedText: { color: C.dark, fontSize: 14 },
  permTitle: { fontSize: 20, fontWeight: '600', color: C.dark, marginBottom: 10, textAlign: 'center' },
  permBody:  { fontSize: 14, color: '#6e5e5e', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permBtn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40,
    marginBottom: 12, width: '100%', alignItems: 'center',
  },
  permBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  permBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.primary },
  permBtnOutlineText: { color: C.primary, fontSize: 15, fontWeight: '600' },

  // Scan line
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(193,124,116,0.7)' },

  // Corner brackets
  corner: { position: 'absolute', width: 22, height: 22 },
  cornerTL: { top: '14%', left: '14%', borderTopWidth: 2, borderLeftWidth: 2, borderColor: C.primary, borderTopLeftRadius: 4 },
  cornerTR: { top: '14%', right: '14%', borderTopWidth: 2, borderRightWidth: 2, borderColor: C.primary, borderTopRightRadius: 4 },
  cornerBL: { bottom: '22%', left: '14%', borderBottomWidth: 2, borderLeftWidth: 2, borderColor: C.primary, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: '22%', right: '14%', borderBottomWidth: 2, borderRightWidth: 2, borderColor: C.primary, borderBottomRightRadius: 4 },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  navTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.iconBtn, alignItems: 'center', justifyContent: 'center',
  },

  // Detecting badge
  detectBadge: {
    position: 'absolute', top: '12%', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(193,124,116,0.2)',
    borderWidth: 1, borderColor: 'rgba(193,124,116,0.5)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary },
  detectText: { color: '#F2E6E3', fontSize: 11, fontWeight: '500' },

  // Fit badge
  fitBadge: {
    position: 'absolute', right: 16, top: '45%',
    backgroundColor: 'rgba(193,124,116,0.15)',
    borderWidth: 1, borderColor: 'rgba(193,124,116,0.4)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center',
  },
  fitLabel: { color: '#F2E6E3', fontSize: 10, marginBottom: 2 },
  fitScore: { color: C.primary, fontSize: 16, fontWeight: '600' },

  // Item label
  itemLabel: {
    position: 'absolute', bottom: 196, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  itemLabelText: { color: '#fff', fontSize: 12, fontWeight: '500' },

  // Bottom panel
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.panelBg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 14, paddingTop: 16, paddingBottom: 32,
  },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  tabActive: { backgroundColor: C.primary },
  tabText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#fff' },

  // Carousel
  carousel: { gap: 10, paddingBottom: 4, marginBottom: 14 },
  itemThumb: {
    width: 58, height: 70, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent', position: 'relative',
  },
  itemThumbActive: { borderColor: C.primary },
  itemCheck: {
    position: 'absolute', top: 3, right: 3,
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
  },

  // Actions
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  captureBtn: {
    flex: 1, backgroundColor: C.primary, borderRadius: 16,
    paddingVertical: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  captureBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  actionIconBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
});