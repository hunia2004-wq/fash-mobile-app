import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, CATEGORIES } from './marketplacedata';

const CONDITIONS = ['Like New', 'Good', 'Fair'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const SelectPill = ({ options, value, onChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.selectPill, value === opt && styles.selectPillActive]}
        onPress={() => onChange(opt)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectPillText, value === opt && styles.selectPillTextActive]}>
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default function AddListingScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [size, setSize] = useState('');

  const isValid = title && price && description && category && condition && size;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    Alert.alert('Listing posted!', 'Your item is now live on the marketplace.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Photo upload */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoUpload} activeOpacity={0.8}>
            <View style={styles.photoIcon}>
              <Ionicons name="camera-outline" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.photoTitle}>Add Photos</Text>
            <Text style={styles.photoSub}>Up to 5 photos · First is cover</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>

          <Field label="Title" required>
            <TextInput
              style={styles.input}
              placeholder="e.g. Floral Wrap Dress"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={setTitle}
            />
          </Field>

          <Field label="Price (USD)" required>
            <View style={styles.priceInput}>
              <Text style={styles.currencySign}>$</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 4 }]}
                placeholder="0.00"
                placeholderTextColor={COLORS.muted}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </Field>

          <Field label="Brand">
            <TextInput
              style={styles.input}
              placeholder="e.g. Zara, H&M, Mango"
              placeholderTextColor={COLORS.muted}
              value={brand}
              onChangeText={setBrand}
            />
          </Field>

          <Field label="Category" required>
            <SelectPill
              options={CATEGORIES.filter(c => c !== 'All')}
              value={category}
              onChange={setCategory}
            />
          </Field>

          <Field label="Size" required>
            <SelectPill options={SIZES} value={size} onChange={setSize} />
          </Field>

          <Field label="Condition" required>
            <SelectPill options={CONDITIONS} value={condition} onChange={setCondition} />
          </Field>

          <Field label="Description" required>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your item — fit, fabric, any flaws..."
              placeholderTextColor={COLORS.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Field>

          <Field label="Location">
            <View style={styles.locationInput}>
              <Ionicons name="location-outline" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 0 }]}
                placeholder="e.g. Dubai, UAE"
                placeholderTextColor={COLORS.muted}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </Field>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit button */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Feather name="check" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Post Listing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  scrollContent: { paddingBottom: 20 },

  photoSection: { paddingHorizontal: 20, marginBottom: 8 },
  photoUpload: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  photoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  photoSub: { fontSize: 12, color: COLORS.muted },

  form: { paddingHorizontal: 20 },

  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: COLORS.accent },

  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: { height: 100, paddingTop: 13 },

  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySign: { fontSize: 16, fontWeight: '700', color: COLORS.accent },

  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  pillsRow: { gap: 8, paddingVertical: 2 },
  selectPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  selectPillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  selectPillText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  selectPillTextActive: { color: COLORS.white },

  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});