import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentDark: '#a5635b',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
  borderInput: '#e0c8c5',
};

const SEASONS   = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-season'];
const ITEM_COLORS = ['Beige', 'Blue', 'Black', 'White', 'Green', 'Pink', 'Red', 'Brown'];
const OCCASIONS = ['Casual', 'Work', 'Evening', 'Sport', 'Formal'];
const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];

const TagRow = ({ options, selected, onToggle }) => (
  <View style={styles.tagRow}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt}
        style={[styles.tag, selected.includes(opt) && styles.tagActive]}
        onPress={() => onToggle(opt)}
        activeOpacity={0.8}
      >
        <Text style={[styles.tagText, selected.includes(opt) && styles.tagTextActive]}>
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function UploadScreen() {
  const [itemName, setItemName]   = useState('');
  const [size, setSize]           = useState('');
  const [brand, setBrand]         = useState('');
  const [price, setPrice]         = useState('');
  const [seasons, setSeasons]     = useState(['Spring']);
  const [colors, setColors]       = useState(['Beige']);
  const [occasions, setOccasions] = useState(['Casual']);
  const [category, setCategory]   = useState('Dresses');

  const toggle = (setter, current, val) =>
    setter(current.includes(val) ? current.filter(v => v !== val) : [...current, val]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add to Wardrobe</Text>
        <Text style={styles.headerSub}>Upload a photo or fill in details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Upload zone */}
        <TouchableOpacity style={styles.uploadZone} activeOpacity={0.8}>
          <View style={styles.uploadIconCircle}>
            <Feather name="camera" size={28} color={COLORS.accent} />
          </View>
          <Text style={styles.uploadText}>Tap to upload photo</Text>
          <Text style={styles.uploadSub}>JPG, PNG, HEIC supported</Text>
        </TouchableOpacity>

        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
            <Text style={styles.btnOutlineText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8}>
            <Ionicons name="images-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
            <Text style={styles.btnOutlineText}>From Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Item details */}
        <Text style={styles.sectionLabel}>Item Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Item Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Floral Midi Dress"
            placeholderTextColor={COLORS.muted}
            value={itemName}
            onChangeText={setItemName}
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Size</Text>
            <TextInput
              style={styles.formInput}
              placeholder="S / M / L"
              placeholderTextColor={COLORS.muted}
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Price (optional)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="$ 0.00"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Brand</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. Zara, H&M, FASH..."
            placeholderTextColor={COLORS.muted}
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={styles.divider} />

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <TagRow
          options={CATEGORIES}
          selected={[category]}
          onToggle={val => setCategory(val)}
        />

        <View style={styles.divider} />

        {/* Season */}
        <Text style={styles.sectionLabel}>Season</Text>
        <TagRow
          options={SEASONS}
          selected={seasons}
          onToggle={val => toggle(setSeasons, seasons, val)}
        />

        <View style={styles.divider} />

        {/* Color */}
        <Text style={styles.sectionLabel}>Color</Text>
        <TagRow
          options={ITEM_COLORS}
          selected={colors}
          onToggle={val => toggle(setColors, colors, val)}
        />

        <View style={styles.divider} />

        {/* Occasion */}
        <Text style={styles.sectionLabel}>Occasion</Text>
        <TagRow
          options={OCCASIONS}
          selected={occasions}
          onToggle={val => toggle(setOccasions, occasions, val)}
        />

        <View style={styles.divider} />

        {/* CTAs */}
        <TouchableOpacity style={styles.btnAccent} activeOpacity={0.85}>
          <Feather name="check" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.btnAccentText}>Save to Wardrobe</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutlineFull} activeOpacity={0.8}>
          <Feather name="shopping-bag" size={15} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.btnOutlineText}>List on Marketplace</Text>
        </TouchableOpacity>

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

  scrollContent: { paddingBottom: 50 },

  uploadZone: {
    margin: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { fontSize: 14, fontWeight: '600', color: COLORS.accent },
  uploadSub: { fontSize: 11, color: COLORS.muted },

  photoRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  btnOutlineHalf: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 12,
  },
  btnOutlineText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },

  divider: { height: 0.5, backgroundColor: COLORS.border, marginHorizontal: 16, marginVertical: 12 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    paddingHorizontal: 16, paddingBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.9,
  },

  formGroup: { paddingHorizontal: 16, marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  formHalf: { flex: 1 },
  formLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.accent,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.borderInput,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  tagActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  tagTextActive: { color: COLORS.white },

  btnAccent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: 16, marginTop: 12, marginBottom: 10,
    borderRadius: 16, paddingVertical: 16,
  },
  btnAccentText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },

  btnOutlineFull: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.accent,
    marginHorizontal: 16, borderRadius: 16, paddingVertical: 15,
  },
});