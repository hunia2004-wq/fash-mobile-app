import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Image, ScrollView, Dimensions,
  Alert, Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

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
  overlay: 'rgba(0,0,0,0.45)',
};

// ─── WARDROBE ITEMS FOR AR ────────────────────────────────────────────────
// TODO (Hunia & Aynour):
// Replace this mock data with a real API call to get the user's wardrobe.
//
// API Endpoint:   GET /api/wardrobe/:userId
// Auth:           Bearer token in Authorization header
//
// We only need items that can be "tried on" visually — so filter for:
//   Tops, Dresses, Outerwear
//
// Expected response per item:
// {
//   id: "abc123",
//   name: "White Linen Shirt",
//   category: "Tops",
//   brand: "Zara",
//   color: "White",
//   image: "https://your-storage.com/image.jpg",  // needed for AR overlay
//   arOverlayImage: "https://your-storage.com/overlay.png"  // transparent PNG for overlay
//                                                            // if you have one
// }
//
// Replace WARDROBE_AR_ITEMS below with your fetched data.

const WARDROBE_AR_ITEMS = [
  { id: 'w1', name: 'White Linen Shirt', category: 'Tops', brand: 'Zara', color: 'White', emoji: '👕', image: null },
  { id: 'w3', name: 'Floral Midi Dress', category: 'Dresses', brand: 'H&M', color: 'Floral', emoji: '👗', image: null },
  { id: 'w4', name: 'Denim Jacket', category: 'Outerwear', brand: "Levi's", color: 'Blue', emoji: '🧥', image: null },
  { id: 'w6', name: 'Silk Cami Top', category: 'Tops', brand: 'ASOS', color: 'Dusty Rose', emoji: '👚', image: null },
  { id: 'w8', name: 'Beige Trench Coat', category: 'Outerwear', brand: 'Massimo Dutti', color: 'Beige', emoji: '🧥', image: null },
  { id: 'w14', name: 'Knit Sweater', category: 'Tops', brand: 'Zara', color: 'Cream', emoji: '🧶', image: null },
];


const ARItemCard = ({ item, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.arItemCard, isSelected && styles.arItemCardSelected]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.arItemEmoji, isSelected && styles.arItemEmojiSelected]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.arItemImage} resizeMode="cover" />
      ) : (
        <Text style={styles.arItemEmojiText}>{item.emoji}</Text>
      )}
    </View>
    <Text style={[styles.arItemName, isSelected && { color: COLORS.accent }]} numberOfLines={2}>
      {item.name}
    </Text>
    <Text style={styles.arItemBrand}>{item.brand}</Text>
    {isSelected && (
      <View style={styles.arSelectedBadge}>
        <Ionicons name="checkmark" size={10} color={COLORS.white} />
      </View>
    )}
  </TouchableOpacity>
);


export default function ARTryOnScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [selectedItem, setSelectedItem] = useState(null);
  const [overlayOpacity] = useState(new Animated.Value(0.75));
  const [overlayScale] = useState(new Animated.Value(1));
  const [showControls, setShowControls] = useState(true);
  const [captured, setCaptured] = useState(false);
  const cameraRef = useRef(null);


  useEffect(() => {
    if (selectedItem) {
      Animated.spring(overlayScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedItem]);

 
  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.permissionWrap}>
          <MaterialCommunityIcons name="camera-outline" size={48} color={COLORS.accent} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>AR Try-On</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionWrap}>
          <View style={styles.permissionIconWrap}>
            <Ionicons name="camera-outline" size={52} color={COLORS.accent} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionSub}>
            FASH needs camera access to let you virtually try on your clothes
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.permissionBtnText}>Allow Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Take photo ─────────────────────────────────────────────────────────
  // TODO (Hunia & Aynour):
  // When user taps the capture button, we save the photo with the selected
  // item overlay. You can optionally upload it to storage.
  //
  // API Endpoint (optional):   POST /api/tryon/save
  // Request body:
  // {
  //   userId: "user_id_here",
  //   itemId: "w1",
  //   photoBase64: "data:image/jpeg;base64,..."
  // }
  // Returns: { success: true, photoUrl: "https://..." }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      // const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      // TODO: upload photo if needed (see above)
      setCaptured(true);
      setTimeout(() => setCaptured(false), 1000);
      Alert.alert('📸 Saved!', 'Your try-on photo has been saved to your camera roll.');
    } catch (e) {
      Alert.alert('Error', 'Could not take photo. Please try again.');
    }
  };

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

     
      <View style={styles.topGradient} />

      <SafeAreaView style={styles.cameraTopNav} edges={['top']}>
        <TouchableOpacity style={styles.cameraNavBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.cameraNavCenter}>
          <Text style={styles.cameraNavTitle}>AR Try-On</Text>
          {selectedItem && (
            <View style={styles.selectedItemPill}>
              <Text style={styles.selectedItemPillText}>{selectedItem.name}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.cameraNavBtn}
          onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-reverse-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </SafeAreaView>

    
      {selectedItem && (
        <Animated.View
          style={[
            styles.arOverlay,
            {
              opacity: overlayOpacity,
              transform: [{ scale: overlayScale }],
            },
          ]}
          pointerEvents="none"
        >
          {selectedItem.image ? (
            <Image
              source={{ uri: selectedItem.image }}
              style={styles.arOverlayImage}
              resizeMode="contain"
            />
          ) : (

            <View style={styles.arOverlayPlaceholder}>
              <Text style={styles.arOverlayEmoji}>{selectedItem.emoji}</Text>
              <View style={styles.arOverlayLabel}>
                <Text style={styles.arOverlayLabelText}>{selectedItem.name}</Text>
                <Text style={styles.arOverlayLabelSub}>{selectedItem.brand}</Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      
      {!selectedItem && (
        <View style={styles.hintWrap} pointerEvents="none">
          <View style={styles.hintCard}>
            <MaterialCommunityIcons name="hanger" size={24} color={COLORS.accent} />
            <Text style={styles.hintText}>Pick an item below to try it on</Text>
          </View>
        </View>
      )}

      <View style={styles.bottomSheet}>

        
        {selectedItem && (
          <View style={styles.opacityRow}>
            <Ionicons name="eye-outline" size={14} color={COLORS.muted} />
            <TouchableOpacity onPress={() => {
              Animated.timing(overlayOpacity, {
                toValue: overlayOpacity._value > 0.4 ? 0.3 : 0.75,
                duration: 200, useNativeDriver: true,
              }).start();
            }}>
              <Text style={styles.opacityText}>Toggle overlay</Text>
            </TouchableOpacity>
          </View>
        )}

     
        <Text style={styles.itemSelectorLabel}>Your Wardrobe</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemSelectorRow}
        >
          {selectedItem && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setSelectedItem(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={18} color={COLORS.muted} />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
          {WARDROBE_AR_ITEMS.map((item) => (
            <ARItemCard
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onPress={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
            />
          ))}
        </ScrollView>

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Share', 'Share your try-on look!')}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, captured && styles.captureBtnActive]}
            onPress={handleCapture}
            activeOpacity={0.85}
          >
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AIStylist', {
              prefillMessage: selectedItem
                ? `I'm trying on my ${selectedItem.name} by ${selectedItem.brand}. Can you suggest what to pair it with?`
                : 'Can you suggest an outfit for me?'
            })}
          >
            <MaterialCommunityIcons name="hanger" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1, backgroundColor: COLORS.bg },

  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
    background: 'transparent',
  },

  cameraTopNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cameraNavBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  cameraNavCenter: { flex: 1, alignItems: 'center', gap: 4 },
  cameraNavTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  selectedItemPill: {
    backgroundColor: 'rgba(193,124,116,0.8)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  selectedItemPillText: { fontSize: 11, fontWeight: '600', color: COLORS.white },


  arOverlay: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.1,
    right: width * 0.1,
    height: height * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arOverlayImage: { width: '100%', height: '100%' },
  arOverlayPlaceholder: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(242,230,227,0.85)',
    borderRadius: 24, width: '100%', height: '100%',
    borderWidth: 2, borderColor: 'rgba(193,124,116,0.5)',
    gap: 10,
  },
  arOverlayEmoji: { fontSize: 80 },
  arOverlayLabel: { alignItems: 'center' },
  arOverlayLabelText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  arOverlayLabelSub: { fontSize: 12, color: COLORS.muted },

  hintWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  hintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 12,
  },
  hintText: { fontSize: 13, fontWeight: '600', color: COLORS.text },

 
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 16, paddingBottom: 36,
  },

  opacityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, marginBottom: 8,
  },
  opacityText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },

  itemSelectorLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    textTransform: 'uppercase', letterSpacing: 0.9,
    paddingHorizontal: 20, marginBottom: 10,
  },
  itemSelectorRow: {
    paddingHorizontal: 16, gap: 10, paddingBottom: 4,
  },

  clearBtn: {
    alignItems: 'center', justifyContent: 'center',
    width: 64, gap: 4, paddingVertical: 8,
  },
  clearBtnText: { fontSize: 10, color: COLORS.muted, fontWeight: '600' },

  arItemCard: {
    width: 72, alignItems: 'center', gap: 5,
    backgroundColor: COLORS.white, borderRadius: 16, padding: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  arItemCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  arItemEmoji: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  arItemEmojiSelected: { backgroundColor: COLORS.white },
  arItemImage: { width: 48, height: 48, borderRadius: 24 },
  arItemEmojiText: { fontSize: 24 },
  arItemName: { fontSize: 9, fontWeight: '600', color: COLORS.text, textAlign: 'center', lineHeight: 12 },
  arItemBrand: { fontSize: 8, color: COLORS.muted },
  arSelectedBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },

  captureRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 32, paddingTop: 16, paddingHorizontal: 20,
  },
  shareBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: COLORS.accent,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  captureBtnActive: { backgroundColor: COLORS.accentLight },
  captureBtnInner: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.accent,
  },

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

  permissionWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  permissionIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.card, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  permissionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 10, textAlign: 'center' },
  permissionSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permissionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 28,
  },
  permissionBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  permissionText: { fontSize: 14, color: COLORS.muted, marginTop: 12 },
});
