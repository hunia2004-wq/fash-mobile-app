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
  white: '#ffffff', border: 'rgba(193,124,116,0.18)', iconBg: '#e3c8c5',
};

const CATEGORIES = ['Shoes', 'Bags', 'Accessories', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const DURATIONS  = ['1 hour', '3 hours', '6 hours', '12 hours', '24 hours', '3 days'];

const DURATION_MS = {
  '1 hour': 3600000, '3 hours': 10800000, '6 hours': 21600000,
  '12 hours': 43200000, '24 hours': 86400000, '3 days': 259200000,
};

const Field = ({ label, required, children, error }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
    {error ? (
      <View style={styles.errorRow}>
        <Ionicons name="alert-circle-outline" size={13} color="#c2185b" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    ) : null}
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
  const [errors,        setErrors]        = useState({});

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const newErrors = {};

    if (!title.trim())
      newErrors.title = 'Please enter an item title';
    else if (title.trim().length < 3)
      newErrors.title = 'Title must be at least 3 characters';

    if (!category)
      newErrors.category = 'Please select a category';

    if (!condition)
      newErrors.condition = 'Please select a condition';

    if (!startingPrice)
      newErrors.startingPrice = 'Please enter a starting price';
    else if (isNaN(parseFloat(startingPrice)) || parseFloat(startingPrice) <= 0)
      newErrors.startingPrice = 'Enter a valid price greater than 0';

    if (!duration)
      newErrors.duration = 'Please select an auction duration';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (fromCamera = false) => {
    if (images.length >= 5) { Alert.alert('Limit reached', 'You can add up to 5 photos.'); return; }
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission required', 'Please allow camera access.'); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets?.length > 0)
        setImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8, allowsMultipleSelection: true, selectionLimit: 5 - images.length,
      });
      if (!result.canceled && result.assets?.length > 0)
        setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const endTime = new Date(Date.now() + DURATION_MS[duration]).toISOString();

      const formData = new FormData();
      formData.append('title',         title.trim());
      formData.append('brand',         brand.trim() || 'Unknown');
      formData.append('description',   description.trim() || `${title} — ${condition}`);
      formData.append('category',      category);
      formData.append('condition',     condition);
      formData.append('startingPrice', parseFloat(startingPrice));
      formData.append('endTime',       endTime);
      if (size) formData.append('size', size.trim());

      images.forEach((uri, index) => {
        formData.append('images', { uri, type: 'image/jpeg', name: `auction_image_${index}.jpg` });
      });

      await createAuction(token, formData);

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

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Auction</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

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
                    {index === 0 && <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>Cover</Text></View>}
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

            <Field label="Item Title" required error={errors.title}>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. YSL Tribute Heels"
                placeholderTextColor={COLORS.muted}
                value={title}
                onChangeText={v => { setTitle(v); clearError('title'); }}
              />
            </Field>

            <Field label="Brand">
              <TextInput style={styles.input} placeholder="e.g. Saint Laurent, Gucci" placeholderTextColor={COLORS.muted} value={brand} onChangeText={setBrand} />
            </Field>

            <Field label="Category" required error={errors.category}>
              <TagRow options={CATEGORIES} selected={category} onSelect={v => { setCategory(v); clearError('category'); }} />
            </Field>

            <Field label="Condition" required error={errors.condition}>
              <TagRow options={CONDITIONS} selected={condition} onSelect={v => { setCondition(v); clearError('condition'); }} />
            </Field>

            <Field label="Size">
              <TextInput style={styles.input} placeholder="e.g. 38, S, One Size" placeholderTextColor={COLORS.muted} value={size} onChangeText={setSize} />
            </Field>

            <Field label="Description">
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your item — condition, materials, any flaws..."
                placeholderTextColor={COLORS.muted}
                value={description}
                onChangeText={setDescription}
                multiline numberOfLines={4} textAlignVertical="top"
              />
            </Field>

            <Field label="Starting Price (EGP)" required error={errors.startingPrice}>
              <View style={[styles.priceInput, errors.startingPrice && styles.inputError]}>
                <Text style={styles.currencySign}>EGP</Text>
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 4 }]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="decimal-pad"
                  value={startingPrice}
                  onChangeText={v => { setStartingPrice(v); clearError('startingPrice'); }}
                />
              </View>
            </Field>

            <Field label="Auction Duration" required error={errors.duration}>
              <TagRow options={DURATIONS} selected={duration} onSelect={v => { setDuration(v); clearError('duration'); }} />
            </Field>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} />
              <Text style={styles.infoText}>
                Your auction goes live immediately once submitted. Buyers can start bidding right away.
              </Text>
            </View>

            {images.length === 0 && (
              <View style={styles.noPhotoNote}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
                <Text style={styles.noPhotoText}>No photos added — auctions with photos attract more bidders</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.ctaBar}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaInfoText}>
              {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''} added` : 'No photos'}
              {' · '}
              {submitting ? 'Creating...' : 'Fill required fields to launch'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
              : <Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
            }
            <Text style={styles.submitBtnText}>{submitting ? 'Creating Auction...' : 'Start Auction'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg },
  topNav:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, marginTop: 50 },
  navBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  navTitle:       { fontSize: 16, fontWeight: '700', color: COLORS.text },
  scrollContent:  { paddingBottom: 20 },
  photoSection:   { paddingHorizontal: 20, marginBottom: 12 },
  photoUpload:    { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 32, gap: 6, marginBottom: 10 },
  photoIcon:      { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  photoTitle:     { fontSize: 15, fontWeight: '700', color: COLORS.text },
  photoSub:       { fontSize: 12, color: COLORS.muted },
  photoRow:       { flexDirection: 'row', gap: 10, marginTop: 4 },
  photoRowBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 10 },
  photoRowBtnText:{ color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  imagePreviewRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  imageThumb:     { width: 80, height: 80, borderRadius: 12, overflow: 'visible', position: 'relative' },
  thumbImg:       { width: 80, height: 80, borderRadius: 12 },
  coverBadge:     { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.accent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  coverBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  removeImgBtn:   { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.white, borderRadius: 10 },
  addMoreBtn:     { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.accent, borderStyle: 'dashed', backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  form:           { paddingHorizontal: 20 },
  field:          { marginBottom: 22 },
  fieldLabel:     { fontSize: 11, fontWeight: '700', color: COLORS.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.9 },
  required:       { color: COLORS.accent },
  input:          { backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#2c2c2c' },
  inputError:     { borderColor: '#c2185b', backgroundColor: '#fce4ec' },
  errorRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText:      { fontSize: 11, color: '#c2185b', fontWeight: '600', flex: 1 },
  textArea:       { height: 100, paddingTop: 13 },
  priceInput:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14 },
  currencySign:   { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tagActive:      { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagText:        { fontSize: 12, color: '#2c2c2c', fontWeight: '500' },
  tagTextActive:  { color: COLORS.white },
  infoCard:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 12 },
  infoText:       { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 19 },
  noPhotoNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff8e1', borderRadius: 12, padding: 12, marginTop: 4 },
  noPhotoText:    { fontSize: 12, color: '#7a5c00', flex: 1 },
  ctaBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  ctaInfo:        { alignItems: 'center' },
  ctaInfoText:    { fontSize: 12, color: COLORS.muted },
  submitBtn:      { flexDirection: 'row', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText:  { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});