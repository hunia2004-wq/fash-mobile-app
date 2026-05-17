import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createAuction } from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
  iconBg: '#e3c8c5',
};

const CATEGORIES = ['Shoes', 'Bags', 'Accessories', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const DURATIONS  = ['1 hour', '3 hours', '6 hours', '12 hours', '24 hours', '3 days'];

const DURATION_MS = {
  '1 hour': 3600000, '3 hours': 10800000, '6 hours': 21600000,
  '12 hours': 43200000, '24 hours': 86400000, '3 days': 259200000,
};

// ── Sub-components — same pattern as AddListingScreen ──────────────
const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const TagRow = ({ options, selected, onSelect }) => (
  <View style={styles.tagRow}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt}
        style={[styles.tag, selected === opt && styles.tagActive]}
        onPress={() => onSelect(opt)}
        activeOpacity={0.8}
      >
        <Text style={[styles.tagText, selected === opt && styles.tagTextActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function CreateAuctionScreen({ navigation }) {
  const { getToken } = useAuth();

  const [title,         setTitle]         = useState('');
  const [brand,         setBrand]         = useState('');
  const [description,   setDescription]   = useState('');
  const [category,      setCategory]      = useState('');
  const [condition,     setCondition]     = useState('');
  const [size,          setSize]          = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [duration,      setDuration]      = useState('');
  const [images,        setImages]        = useState([]);
  const [submitting,    setSubmitting]    = useState(false);

  const isValid = title && category && condition && startingPrice && duration;

  // ── Image pickers ──────────────────────────────────────────────
  const pickImage = async (fromCamera = false) => {
    if (images.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 photos.');
      return;
    }
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow camera access.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets?.length > 0) {
        setImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
      }
    }
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  // ── Submit — bug fixed: token declared before use ──────────────
  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
  
    try {
      setSubmitting(true);
      const token = await getToken();
  
      const endTime = new Date(Date.now() + DURATION_MS[duration]).toISOString();
  
      await createAuction(token, {
        title:         title.trim(),
        brand:         brand.trim() || 'Unknown',
        description:   description.trim() || `${title} — ${condition}`,
        category,
        condition,
        startingPrice: parseFloat(startingPrice),
        endTime,
        ...(size && { size: size.trim() }),
      });
  
      Alert.alert(
        'Auction Created! 🎉',
        'Your auction is now live. Buyers can start bidding right away.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create auction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Top nav — matches AddListingScreen exactly */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Auction</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo upload zone — matches AddListingScreen */}
          <View style={styles.photoSection}>
            {images.length === 0 ? (
              <TouchableOpacity style={styles.photoUpload} onPress={() => pickImage(false)} activeOpacity={0.8}>
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
                  <TouchableOpacity style={styles.addMoreBtn} onPress={() => pickImage(false)} activeOpacity={0.8}>
                    <Ionicons name="add" size={28} color={COLORS.accent} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoRowBtn} onPress={() => pickImage(true)} activeOpacity={0.8}>
                <Ionicons name="camera-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
                <Text style={styles.photoRowBtnText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoRowBtn} onPress={() => pickImage(false)} activeOpacity={0.8}>
                <Ionicons name="images-outline" size={15} color={COLORS.accent} style={{ marginRight: 5 }} />
                <Text style={styles.photoRowBtnText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.form}>

            <Field label="Item Title" required>
              <TextInput
                style={styles.input}
                placeholder="e.g. YSL Tribute Heels"
                placeholderTextColor={COLORS.muted}
                value={title}
                onChangeText={setTitle}
              />
            </Field>

            <Field label="Brand">
              <TextInput
                style={styles.input}
                placeholder="e.g. Saint Laurent, Gucci"
                placeholderTextColor={COLORS.muted}
                value={brand}
                onChangeText={setBrand}
              />
            </Field>

            <Field label="Category" required>
              <TagRow options={CATEGORIES} selected={category} onSelect={setCategory} />
            </Field>

            <Field label="Condition" required>
              <TagRow options={CONDITIONS} selected={condition} onSelect={setCondition} />
            </Field>

            <Field label="Size">
              <TextInput
                style={styles.input}
                placeholder="e.g. 38, S, One Size"
                placeholderTextColor={COLORS.muted}
                value={size}
                onChangeText={setSize}
              />
            </Field>

            <Field label="Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your item — condition, materials, any flaws..."
                placeholderTextColor={COLORS.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Field>

            <Field label="Starting Price (EGP)" required>
              <View style={styles.priceInput}>
                <Text style={styles.currencySign}>EGP</Text>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 4 }]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="decimal-pad"
                  value={startingPrice}
                  onChangeText={setStartingPrice}
                />
              </View>
            </Field>

            <Field label="Auction Duration" required>
              <TagRow options={DURATIONS} selected={duration} onSelect={setDuration} />
            </Field>

            {/* Info card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} />
              <Text style={styles.infoText}>
                Your auction goes live immediately once submitted. Buyers can start bidding right away.
              </Text>
            </View>

            {/* Image count reminder */}
            {images.length === 0 && (
              <View style={styles.noPhotoNote}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
                <Text style={styles.noPhotoText}>
                  No photos added — auctions with photos attract more bidders
                </Text>
              </View>
            )}

          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* CTA bar — matches AddListingScreen */}
        <View style={styles.ctaBar}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaInfoText}>
              {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''} added` : 'No photos'}
              {' · '}
              {isValid ? 'Ready to launch' : 'Fill required fields'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || submitting) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            )}
            <Text style={styles.submitBtnText}>
              {submitting ? 'Creating Auction...' : 'Start Auction'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: COLORS.bg },
  topNav:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, marginTop: 50 },
  navBtn:             { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle:           { fontSize: 16, fontWeight: '700', color: COLORS.text },
  scrollContent:      { paddingBottom: 20 },

  // Photo section — identical to AddListingScreen
  photoSection:       { paddingHorizontal: 20, marginBottom: 12 },
  photoUpload:        { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 32, gap: 6, marginBottom: 10 },
  photoIcon:          { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  photoTitle:         { fontSize: 15, fontWeight: '700', color: COLORS.text },
  photoSub:           { fontSize: 12, color: COLORS.muted },
  photoRow:           { flexDirection: 'row', gap: 10, marginTop: 4 },
  photoRowBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 10 },
  photoRowBtnText:    { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  imagePreviewRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  imageThumb:         { width: 80, height: 80, borderRadius: 12, overflow: 'visible', position: 'relative' },
  thumbImg:           { width: 80, height: 80, borderRadius: 12 },
  coverBadge:         { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.accent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  coverBadgeText:     { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  removeImgBtn:       { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.white, borderRadius: 10 },
  addMoreBtn:         { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.accent, borderStyle: 'dashed', backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },

  // Form — identical to AddListingScreen
  form:               { paddingHorizontal: 20 },
  field:              { marginBottom: 22 },
  fieldLabel:         { fontSize: 11, fontWeight: '700', color: COLORS.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9 },
  required:           { color: COLORS.accent },
  input:              { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#2c2c2c' },
  textArea:           { height: 100, paddingTop: 13 },
  priceInput:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14 },
  currencySign:       { fontSize: 16, fontWeight: '700', color: COLORS.accent },

  // Tags — wrapping chips same as AddListingScreen
  tagRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:                { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tagActive:          { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagText:            { fontSize: 12, color: '#2c2c2c', fontWeight: '500' },
  tagTextActive:      { color: COLORS.white },

  // Info / reminder cards
  infoCard:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 12 },
  infoText:           { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 19 },
  noPhotoNote:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff8e1', borderRadius: 12, padding: 12, marginTop: 4 },
  noPhotoText:        { fontSize: 12, color: '#7a5c00', flex: 1 },

  // CTA bar — identical to AddListingScreen
  ctaBar:             { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  ctaInfo:            { alignItems: 'center' },
  ctaInfoText:        { fontSize: 12, color: COLORS.muted },
  submitBtn:          { flexDirection: 'row', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled:  { opacity: 0.45 },
  submitBtnText:      { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});