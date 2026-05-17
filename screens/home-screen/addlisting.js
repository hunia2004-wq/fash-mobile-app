import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, CATEGORIES } from './marketplacedata';
import { createListing } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

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

const TagRow = ({ options, selected, onSelect }) => (
  <View style={styles.tagRow}>
    {options.map(opt => {
      const isActive = selected === opt;
      return (
        <TouchableOpacity
          key={opt}
          style={[styles.tag, isActive && styles.tagActive]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function AddListingScreen({ navigation }) {
  const { getToken } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [size, setSize] = useState('');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const isValid = title && price && description && category && condition && size;

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 photos.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 photos.');
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();

      // Plain JSON — backend /listings expects JSON not FormData
      await createListing(token, {
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category,
        condition,
        size,
        ...(brand    && { brand:    brand.trim()    }),
        ...(location && { location: location.trim() }),
      });

      Alert.alert(
        'Listing posted!',
        'Your item is now live on the Marketplace.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Top nav — matches Marketplace navBtn style exactly */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo upload */}
        <View style={styles.photoSection}>
          {images.length === 0 ? (
            <TouchableOpacity style={styles.photoUpload} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.photoIcon}>
                <Ionicons name="camera-outline" size={32} color={COLORS.accent} />
              </View>
              <Text style={styles.photoTitle}>Add Photos</Text>
              <Text style={styles.photoSub}>Up to 5 photos · First is cover</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreviewRow}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={18} color="#E05C5C" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity style={styles.addMoreBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Ionicons name="add" size={28} color={COLORS.accent} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoRowBtn} onPress={takePhoto} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
              <Text style={styles.photoRowBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoRowBtn} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
              <Text style={styles.photoRowBtnText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
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

          <Field label="Price (EGP)" required>
            <View style={styles.priceInput}>
              <Text style={styles.currencySign}>EGP</Text>
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
            <TagRow
              options={CATEGORIES.filter(c => c !== 'All')}
              selected={category}
              onSelect={setCategory}
            />
          </Field>

          <Field label="Size" required>
            <TagRow options={SIZES} selected={size} onSelect={setSize} />
          </Field>

          <Field label="Condition" required>
            <TagRow options={CONDITIONS} selected={condition} onSelect={setCondition} />
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
                placeholder="e.g. Cairo, Egypt"
                placeholderTextColor={COLORS.muted}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </Field>

        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Submit */}
      <View style={styles.ctaBar}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid || saving) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
          ) : (
            <Feather name="check" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
          )}
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
    marginTop: 50,
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

  photoSection: { paddingHorizontal: 20, marginBottom: 12 },

  photoUpload: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
    marginBottom: 10,
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

  photoRow: { flexDirection: 'row', gap: 10, marginTop: 4 },

  photoRowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 10,
  },

  photoRowBtnText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },

  imagePreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },

  imageThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'visible', position: 'relative' },

  thumbImg: { width: 80, height: 80, borderRadius: 12 },

  coverBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: COLORS.accent, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },

  coverBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },

  removeImgBtn: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: COLORS.white, borderRadius: 10,
  },

  addMoreBtn: {
    width: 80, height: 80, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.accent,
    borderStyle: 'dashed', backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },

  form: { paddingHorizontal: 20 },

  field: { marginBottom: 20 },

  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.accent,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9,
  },

  required: { color: COLORS.accent },

  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: '#e0c8c5',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#2c2c2c',
  },

  textArea: { height: 100, paddingTop: 13 },

  priceInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1,
    borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14,
  },

  currencySign: { fontSize: 16, fontWeight: '700', color: COLORS.accent },

  locationInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1,
    borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14,
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  tag: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },

  tagActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },

  tagText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  tagTextActive: { color: COLORS.white },

  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
  },

  submitBtn: {
    flexDirection: 'row', backgroundColor: COLORS.accent,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },

  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});