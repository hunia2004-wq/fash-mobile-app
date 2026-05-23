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

const BASE_URL = 'https://fash-backend-cp3n.vercel.app/api/v1';

const CONDITIONS = ['Like New', 'Good', 'Fair'];

const SIZE_OPTIONS = {
  Shoes:                ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  Bags:                 ['One Size'],
  Perfumes:             ['30ml', '50ml', '75ml', '100ml', '150ml', '200ml'],
  Accessories:          ['One Size'],
  'Newborn Accessories':['One Size'],
  default:              ['One Size'],
};

const getSizesForCategory = (cat) => SIZE_OPTIONS[cat] ?? SIZE_OPTIONS.default;

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
    {options.map(opt => {
      const isActive = selected === opt;
      return (
        <TouchableOpacity
          key={opt}
          style={[styles.tag, isActive && styles.tagActive]}
          onPress={() => onSelect(opt)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function AddListingScreen({ navigation }) {
  const { getToken } = useAuth();

  const [title,       setTitle]       = useState('');
  const [price,       setPrice]       = useState('');
  const [description, setDescription] = useState('');
  const [brand,       setBrand]       = useState('');
  const [location,    setLocation]    = useState('');
  const [category,    setCategory]    = useState('');
  const [condition,   setCondition]   = useState('');
  const [size,        setSize]        = useState('');
  const [images,      setImages]      = useState([]);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});

  const [validatingImage, setValidatingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState(null);

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  const validate = () => {
    const newErrors = {};
    if (!title.trim())
      newErrors.title = 'Please enter a title';
    else if (title.trim().length < 3)
      newErrors.title = 'Title must be at least 3 characters';

    if (!price)
      newErrors.price = 'Please enter a price';
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      newErrors.price = 'Enter a valid price greater than 0';

    if (!category)
      newErrors.category = 'Please select a category';

    if (!condition)
      newErrors.condition = 'Please select a condition';

    if (!effectiveSize)
      newErrors.size = 'Please select a size';

    if (!description.trim())
      newErrors.description = 'Please add a description';
    else if (description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    clearError('category');
    const validSizes = getSizesForCategory(cat);
    if (size && !validSizes.includes(size)) setSize('');
    if (images.length > 0) validateImageForCategory(images[0], cat);
  };

  const availableSizes = category ? getSizesForCategory(category) : SIZE_OPTIONS.default;
  const autoOneSize    = availableSizes.length === 1 && availableSizes[0] === 'One Size';
  const effectiveSize  = autoOneSize ? 'One Size' : size;

  const isValid = !Object.values(errors).some(Boolean);

  const validateImageForCategory = async (imageUri, cat) => {
    if (!cat) return;
    try {
      setValidatingImage(true);
      setImageValidation(null);
      const token = await getToken();
      const formData = new FormData();
      formData.append('image',    { uri: imageUri, type: 'image/jpeg', name: 'validate.jpg' });
      formData.append('category', cat);
      const response = await fetch(`${BASE_URL}/listings/validate-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      setImageValidation(data);
    } catch {
      setImageValidation({ valid: true, message: '' });
    } finally {
      setValidatingImage(false);
    }
  };

  const pickImage = async (fromCamera = false) => {
    if (images.length >= 5) { Alert.alert('Limit reached', 'You can add up to 5 photos.'); return; }
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission required', 'Please allow camera access.'); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImages(prev => [...prev, uri].slice(0, 5));
        if (category) validateImageForCategory(uri, category);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8, allowsMultipleSelection: true, selectionLimit: 5 - images.length,
      });
      if (!result.canceled) {
        const uris = result.assets.map(a => a.uri);
        setImages(prev => [...prev, ...uris].slice(0, 5));
        if (category && uris.length > 0) validateImageForCategory(uris[0], category);
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (index === 0) setImageValidation(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (imageValidation?.valid === false) {
      Alert.alert('Wrong category', imageValidation.message);
      return;
    }
    try {
      setSaving(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append('title',       title.trim());
      formData.append('price',       price);
      formData.append('description', description.trim());
      formData.append('category',    category);
      formData.append('condition',   condition);
      formData.append('size',        effectiveSize);
      if (brand)    formData.append('brand',    brand.trim());
      if (location) formData.append('location', location.trim());
      images.forEach((uri, i) => {
        formData.append('images', { uri, type: 'image/jpeg', name: `photo_${i}.jpg` });
      });
      await createListing(token, formData);
      Alert.alert('Listing Posted! 🎉', 'Your item is now live on the Marketplace.',
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

      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Listing</Text>
        <View style={{ width: 40 }} />
      </View>

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

          {validatingImage && (
            <View style={styles.validationRow}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.validatingText}>Checking image matches category...</Text>
            </View>
          )}
          {imageValidation && !validatingImage && (
            <View style={[styles.validationRow, { backgroundColor: imageValidation.valid ? '#e8f5e9' : '#fce4ec' }]}>
              <Ionicons name={imageValidation.valid ? 'checkmark-circle' : 'close-circle'} size={16} color={imageValidation.valid ? '#388e3c' : '#c2185b'} />
              <Text style={[styles.validationText, { color: imageValidation.valid ? '#388e3c' : '#c2185b' }]}>{imageValidation.message}</Text>
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

          <Field label="Title" required error={errors.title}>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g. Nike Air Max Size 42"
              placeholderTextColor={COLORS.muted}
              value={title}
              onChangeText={v => { setTitle(v); clearError('title'); }}
            />
          </Field>

          <Field label="Price (EGP)" required error={errors.price}>
            <View style={[styles.priceInput, errors.price && styles.inputError]}>
              <Text style={styles.currencySign}>EGP</Text>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 4 }]}
                placeholder="0.00"
                placeholderTextColor={COLORS.muted}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={v => { setPrice(v); clearError('price'); }}
              />
            </View>
          </Field>

          <Field label="Brand">
            <TextInput style={styles.input} placeholder="e.g. Nike, Zara, H&M" placeholderTextColor={COLORS.muted} value={brand} onChangeText={setBrand} />
          </Field>

          <Field label="Category" required error={errors.category}>
            <TagRow options={CATEGORIES.filter(c => c !== 'All')} selected={category} onSelect={handleCategorySelect} />
          </Field>

          <Field label="Condition" required error={errors.condition}>
            <TagRow options={CONDITIONS} selected={condition} onSelect={v => { setCondition(v); clearError('condition'); }} />
          </Field>

          <Field label="Size" required error={errors.size}>
            {autoOneSize ? (
              <View style={styles.autoSizeNote}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />
                <Text style={styles.autoSizeText}>One Size — no selection needed</Text>
              </View>
            ) : (
              <>
                {category
                  ? <Text style={styles.sizeHint}>{category === 'Shoes' ? 'EU shoe sizes' : category === 'Perfumes' ? 'Bottle size' : 'One size fits all'}</Text>
                  : <Text style={styles.sizeHint}>Select a category first to see size options</Text>
                }
                <TagRow options={availableSizes} selected={size} onSelect={v => { setSize(v); clearError('size'); }} />
              </>
            )}
          </Field>

          <Field label="Description" required error={errors.description}>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your item — fit, fabric, any flaws..."
              placeholderTextColor={COLORS.muted}
              value={description}
              onChangeText={v => { setDescription(v); clearError('description'); }}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </Field>

          <Field label="Location">
            <View style={styles.locationInput}>
              <Ionicons name="location-outline" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
              <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingLeft: 0 }]} placeholder="e.g. Cairo, Egypt" placeholderTextColor={COLORS.muted} value={location} onChangeText={setLocation} />
            </View>
          </Field>

          {images.length === 0 && (
            <View style={styles.noPhotoNote}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
              <Text style={styles.noPhotoText}>No photos added — listings with photos sell much faster</Text>
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
            {validatingImage ? 'Validating image...' : 'Fill required fields to post'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, (saving || validatingImage) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={saving || validatingImage}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
            : <Feather name="check" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
          }
          <Text style={styles.submitBtnText}>{saving ? 'Posting...' : 'Post Listing'}</Text>
        </TouchableOpacity>
      </View>
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
  photoRow:       { flexDirection: 'row', gap: 10, marginTop: 8 },
  photoRowBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.accent, borderRadius: 14, paddingVertical: 10 },
  photoRowBtnText:{ color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  imagePreviewRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  imageThumb:     { width: 80, height: 80, borderRadius: 12, overflow: 'visible', position: 'relative' },
  thumbImg:       { width: 80, height: 80, borderRadius: 12 },
  coverBadge:     { position: 'absolute', bottom: 4, left: 4, backgroundColor: COLORS.accent, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  coverBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  removeImgBtn:   { position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.white, borderRadius: 10 },
  addMoreBtn:     { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.accent, borderStyle: 'dashed', backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  validationRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 10, marginBottom: 8 },
  validatingText: { fontSize: 12, color: COLORS.muted },
  validationText: { flex: 1, fontSize: 12, fontWeight: '600' },
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
  locationInput:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#e0c8c5', borderRadius: 12, paddingHorizontal: 14 },
  tagRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tagActive:      { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  tagText:        { fontSize: 12, color: '#2c2c2c', fontWeight: '500' },
  tagTextActive:  { color: COLORS.white },
  sizeHint:       { fontSize: 11, color: COLORS.muted, marginBottom: 8, fontStyle: 'italic' },
  autoSizeNote:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  autoSizeText:   { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
  noPhotoNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff8e1', borderRadius: 12, padding: 12, marginBottom: 8 },
  noPhotoText:    { fontSize: 12, color: '#7a5c00', flex: 1 },
  ctaBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 32, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  ctaInfo:        { alignItems: 'center' },
  ctaInfoText:    { fontSize: 12, color: COLORS.muted },
  submitBtn:      { flexDirection: 'row', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText:  { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});