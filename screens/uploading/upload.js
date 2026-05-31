import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, StatusBar, Image, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { createWardrobeItem, createListing } from '../../services/authService';
import { wp, hp, fp } from '../../utils/responsive';

const BASE_URL = 'https://fash-backend-cp3n.vercel.app/api/v1';
const SEASONS    = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-season'];
const OCCASIONS  = ['Casual', 'Work', 'Evening', 'Sport', 'Formal'];
const WARDROBE_CATEGORIES    = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const MARKETPLACE_CATEGORIES = ['Shoes', 'Bags', 'Perfumes', 'Accessories', 'Newborn Accessories'];
const SIZE_OPTIONS = { Shoes: ['35','36','37','38','39','40','41','42','43','44','45'], Bags: ['One Size'], Perfumes: ['30ml','50ml','75ml','100ml','150ml','200ml'], Accessories: ['One Size'], 'Newborn Accessories': ['One Size'], default: ['XS','S','M','L','XL','XXL','One Size'] };
const getSizesForCategory = (cat) => SIZE_OPTIONS[cat] ?? SIZE_OPTIONS.default;
const CONDITIONS = ['Like New', 'Good', 'Fair'];

const EMPTY_STATE = { itemName: '', size: '', brand: '', price: '', description: '', location: '', condition: '', seasons: ['Spring'], occasions: ['Casual'], category: '', imageUri: null };

const ModeToggle = ({ mode, onChange }) => (
  <View style={styles.modeWrap}>
    <TouchableOpacity style={[styles.modeBtn, mode === 'wardrobe' && styles.modeBtnActive]} onPress={() => onChange('wardrobe')} activeOpacity={0.8}>
      <Ionicons name="shirt-outline" size={wp(16)} color={mode === 'wardrobe' ? 'white' : '#C17C74'} style={{ marginRight: wp(6) }} />
      <Text style={[styles.modeBtnText, mode === 'wardrobe' && styles.modeBtnTextActive]}>My Wardrobe</Text>
    </TouchableOpacity>
    <TouchableOpacity style={[styles.modeBtn, mode === 'marketplace' && styles.modeBtnActive]} onPress={() => onChange('marketplace')} activeOpacity={0.8}>
      <Ionicons name="storefront-outline" size={wp(16)} color={mode === 'marketplace' ? 'white' : '#C17C74'} style={{ marginRight: wp(6) }} />
      <Text style={[styles.modeBtnText, mode === 'marketplace' && styles.modeBtnTextActive]}>Marketplace</Text>
    </TouchableOpacity>
  </View>
);

const TagRow = ({ options, selected, onToggle, single = false }) => (
  <View style={styles.tagRow}>
    {options.map(opt => {
      const isActive = single ? selected === opt : selected.includes(opt);
      return (
        <TouchableOpacity key={opt} style={[styles.tag, isActive && styles.tagActive]} onPress={() => onToggle(opt)} activeOpacity={0.8}>
          <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function UploadScreen({ navigation }) {
  const { getToken } = useAuth();
  const scrollRef = useRef(null);
  const [mode, setMode] = useState('wardrobe');
  const [itemName, setItemName] = useState(EMPTY_STATE.itemName);
  const [size, setSize] = useState(EMPTY_STATE.size);
  const [brand, setBrand] = useState(EMPTY_STATE.brand);
  const [price, setPrice] = useState(EMPTY_STATE.price);
  const [condition, setCondition] = useState(EMPTY_STATE.condition);
  const [seasons, setSeasons] = useState(EMPTY_STATE.seasons);
  const [occasions, setOccasions] = useState(EMPTY_STATE.occasions);
  const [category, setCategory] = useState(EMPTY_STATE.category);
  const [imageUri, setImageUri] = useState(EMPTY_STATE.imageUri);
  const [description, setDescription] = useState(EMPTY_STATE.description);
  const [location, setLocation] = useState(EMPTY_STATE.location);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [validatingImage, setValidatingImage] = useState(false);
  const [imageValidation, setImageValidation] = useState(null);

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  useFocusEffect(useCallback(() => {
    setItemName(EMPTY_STATE.itemName); setSize(EMPTY_STATE.size); setBrand(EMPTY_STATE.brand);
    setPrice(EMPTY_STATE.price); setCondition(EMPTY_STATE.condition); setSeasons(EMPTY_STATE.seasons);
    setOccasions(EMPTY_STATE.occasions); setCategory(EMPTY_STATE.category); setDescription(EMPTY_STATE.description);
    setLocation(EMPTY_STATE.location); setImageUri(EMPTY_STATE.imageUri); setSaving(false);
    setImageValidation(null); setErrors({});
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const handleModeChange = (newMode) => { setMode(newMode); setCategory(EMPTY_STATE.category); setSize(EMPTY_STATE.size); setCondition(EMPTY_STATE.condition); setImageValidation(null); setErrors({}); };

  const resetForm = () => {
    setItemName(EMPTY_STATE.itemName); setSize(EMPTY_STATE.size); setBrand(EMPTY_STATE.brand);
    setPrice(EMPTY_STATE.price); setCondition(EMPTY_STATE.condition); setSeasons(EMPTY_STATE.seasons);
    setOccasions(EMPTY_STATE.occasions); setCategory(EMPTY_STATE.category); setDescription(EMPTY_STATE.description);
    setLocation(EMPTY_STATE.location); setImageUri(EMPTY_STATE.imageUri); setImageValidation(null); setErrors({});
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const toggle = (setter, current, val) => setter(current.includes(val) ? current.filter(v => v !== val) : [...current, val]);

  const validateImageForCategory = async (uri, cat) => {
    if (!cat || !uri) return;
    try {
      setValidatingImage(true); setImageValidation(null);
      const token = await getToken();
      const formData = new FormData();
      formData.append('image', { uri, type: 'image/jpeg', name: 'validate.jpg' });
      formData.append('category', cat);
      const response = await fetch(`${BASE_URL}/listings/validate-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await response.json();
      setImageValidation(data);
    } catch { setImageValidation({ valid: true, message: '' }); }
    finally { setValidatingImage(false); }
  };

  const pickImage = async (fromCamera = false) => {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert('Camera Access Required', 'Please enable camera access in your device settings.'); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
      if (!result.canceled && result.assets?.length > 0) { const uri = result.assets[0].uri; setImageUri(uri); if (isMarketplace && category) validateImageForCategory(uri, category); }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert('Photo Library Access Required', 'Please enable photo library access in your device settings.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: false });
      if (!result.canceled && result.assets?.length > 0) { const uri = result.assets[0].uri; setImageUri(uri); if (isMarketplace && category) validateImageForCategory(uri, category); }
    }
  };

  const availableSizes = getSizesForCategory(category);
  const autoOneSize = availableSizes.length === 1 && availableSizes[0] === 'One Size';
  const isMarketplace = mode === 'marketplace';
  const categories = isMarketplace ? MARKETPLACE_CATEGORIES : WARDROBE_CATEGORIES;

  const validate = () => {
    const newErrors = {};
    if (!itemName.trim()) newErrors.itemName = isMarketplace ? 'Please enter a listing title' : 'Please enter an item name';
    else if (itemName.trim().length < 2) newErrors.itemName = 'Name must be at least 2 characters';
    if (!category) newErrors.category = 'Please select a category';
    if (isMarketplace) {
      if (!price) newErrors.price = 'Please enter a price';
      else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = 'Enter a valid price greater than 0';
      if (!condition) newErrors.condition = 'Please select a condition';
      if (!description.trim()) newErrors.description = 'Please add a description';
      else if (description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (isMarketplace && imageValidation?.valid === false) { Alert.alert('Wrong category', imageValidation.message); return; }
    try {
      setSaving(true);
      const token = await getToken();
      if (isMarketplace) {
        const formData = new FormData();
        formData.append('title', itemName.trim()); formData.append('price', price); formData.append('category', category);
        formData.append('condition', condition); formData.append('size', autoOneSize ? 'One Size' : size || 'One Size');
        formData.append('description', description.trim());
        if (brand) formData.append('brand', brand.trim());
        if (location) formData.append('location', location.trim());
        if (imageUri) formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo_0.jpg' });
        await createListing(token, formData);
        Alert.alert('Listed! 🎉', 'Your item is now live on the Marketplace.', [{ text: 'Add Another', onPress: resetForm }, { text: 'Go to Marketplace', onPress: () => navigation.navigate('MarketplaceHome') }]);
      } else {
        const formData = new FormData();
        formData.append('name', itemName.trim()); formData.append('category', category);
        if (size) formData.append('size', size); if (brand) formData.append('brand', brand);
        if (price) formData.append('price', price); if (seasons.length) formData.append('season', seasons[0]);
        if (occasions.length) formData.append('occasion', occasions[0]);
        if (imageUri) formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo_0.jpg' });
        await createWardrobeItem(token, formData);
        Alert.alert('Saved! 🎉', 'Item added to your wardrobe.', [{ text: 'Add Another', onPress: resetForm }, { text: 'Go to Wardrobe', onPress: () => navigation.navigate('WardrobeTab') }]);
      }
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.logoHeader}>
        <Image source={require('../../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <ModeToggle mode={mode} onChange={handleModeChange} />
      <View style={[styles.modeBanner, isMarketplace && styles.modeBannerMarket]}>
        <Ionicons name={isMarketplace ? 'storefront-outline' : 'shirt-outline'} size={wp(14)} color={isMarketplace ? '#388e3c' : '#C17C74'} style={{ marginRight: wp(6) }} />
        <Text style={[styles.modeBannerText, isMarketplace && styles.modeBannerTextMarket]}>
          {isMarketplace ? 'Item will be listed publicly on the Marketplace for sale only' : 'Item will be saved privately to your wardrobe only'}
        </Text>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={[styles.uploadZone, isMarketplace && styles.uploadZoneMarket]} activeOpacity={0.8} onPress={() => pickImage(false)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.uploadIconCircle}><Feather name="camera" size={wp(28)} color="#C17C74" /></View>
              <Text style={styles.uploadText}>Tap to upload photo</Text>
              <Text style={styles.uploadSub}>{isMarketplace ? 'A clear photo helps sell faster' : 'JPG, PNG, HEIC supported'}</Text>
            </>
          )}
        </TouchableOpacity>

        {isMarketplace && validatingImage && (
          <View style={styles.validationRow}>
            <ActivityIndicator size="small" color="#C17C74" />
            <Text style={styles.validatingText}>Checking image matches category...</Text>
          </View>
        )}
        {isMarketplace && imageValidation && !validatingImage && (
          <View style={[styles.validationRow, { backgroundColor: imageValidation.valid ? '#e8f5e9' : '#fce4ec' }]}>
            <Ionicons name={imageValidation.valid ? 'checkmark-circle' : 'close-circle'} size={wp(16)} color={imageValidation.valid ? '#388e3c' : '#c2185b'} />
            <Text style={[styles.validationText, { color: imageValidation.valid ? '#388e3c' : '#c2185b' }]}>{imageValidation.message}</Text>
          </View>
        )}

        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8} onPress={() => pickImage(true)}>
            <Ionicons name="camera-outline" size={wp(15)} color="#C17C74" style={{ marginRight: wp(5) }} />
            <Text style={styles.btnOutlineText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8} onPress={() => pickImage(false)}>
            <Ionicons name="images-outline" size={wp(15)} color="#C17C74" style={{ marginRight: wp(5) }} />
            <Text style={styles.btnOutlineText}>From Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Item Details</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>{isMarketplace ? 'Listing Title *' : 'Item Name *'}</Text>
          <TextInput style={[styles.formInput, errors.itemName && styles.inputError]} placeholder={isMarketplace ? 'e.g. Nike Air Max Size 42' : 'e.g. Floral Midi Dress'} placeholderTextColor="#888888" value={itemName} onChangeText={v => { setItemName(v); clearError('itemName'); }} />
          {errors.itemName ? <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={wp(13)} color="#c2185b" /><Text style={styles.errorText}>{errors.itemName}</Text></View> : null}
        </View>

        <View style={styles.formRow}>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>{isMarketplace ? 'Price (EGP) *' : 'Price (optional)'}</Text>
            <TextInput style={[styles.formInput, isMarketplace && styles.formInputRequired, errors.price && styles.inputError]} placeholder="EGP 0.00" placeholderTextColor="#888888" keyboardType="decimal-pad" value={price} onChangeText={v => { setPrice(v); clearError('price'); }} />
            {errors.price ? <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={wp(13)} color="#c2185b" /><Text style={styles.errorText}>{errors.price}</Text></View> : null}
          </View>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Brand</Text>
            <TextInput style={styles.formInput} placeholder="e.g. Nike, Zara..." placeholderTextColor="#888888" value={brand} onChangeText={setBrand} />
          </View>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Category *</Text>
        <TagRow options={categories} selected={category} onToggle={val => { setCategory(val); setSize(''); setImageValidation(null); clearError('category'); if (isMarketplace && imageUri) validateImageForCategory(imageUri, val); }} single />
        {errors.category ? <View style={[styles.errorRow, { paddingHorizontal: wp(16), marginTop: hp(6) }]}><Ionicons name="alert-circle-outline" size={wp(13)} color="#c2185b" /><Text style={styles.errorText}>{errors.category}</Text></View> : null}

        <View style={styles.divider} />
        {isMarketplace && (
          <>
            <Text style={styles.sectionLabel}>Condition *</Text>
            <TagRow options={CONDITIONS} selected={condition} onToggle={v => { setCondition(v); clearError('condition'); }} single />
            {errors.condition ? <View style={[styles.errorRow, { paddingHorizontal: wp(16), marginTop: hp(6) }]}><Ionicons name="alert-circle-outline" size={wp(13)} color="#c2185b" /><Text style={styles.errorText}>{errors.condition}</Text></View> : null}
            <View style={styles.divider} />
          </>
        )}

        <Text style={styles.sectionLabel}>Size</Text>
        {isMarketplace ? (
          autoOneSize ? (
            <View style={styles.autoSizeNote}><Ionicons name="checkmark-circle" size={wp(16)} color="#C17C74" /><Text style={styles.autoSizeText}>One Size — no selection needed</Text></View>
          ) : (
            <>
              {!category && <Text style={styles.sizeHint}>Select a category first to see size options</Text>}
              <TagRow options={availableSizes} selected={size} onToggle={setSize} single />
            </>
          )
        ) : (
          <View style={styles.formGroup}>
            <TextInput style={styles.formInput} placeholder="S / M / L / XL / 42..." placeholderTextColor="#888888" value={size} onChangeText={setSize} />
          </View>
        )}

        {!isMarketplace && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Season</Text>
            <TagRow options={SEASONS} selected={seasons} onToggle={val => toggle(setSeasons, seasons, val)} />
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Occasion</Text>
            <TagRow options={OCCASIONS} selected={occasions} onToggle={val => toggle(setOccasions, occasions, val)} />
          </>
        )}

        {isMarketplace && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Description *</Text>
            <View style={styles.formGroup}>
              <TextInput style={[styles.formInput, styles.textArea, errors.description && styles.inputError]} placeholder="Describe your item — fit, material, any flaws..." placeholderTextColor="#888888" value={description} onChangeText={v => { setDescription(v); clearError('description'); }} multiline numberOfLines={4} textAlignVertical="top" />
              {errors.description ? <View style={styles.errorRow}><Ionicons name="alert-circle-outline" size={wp(13)} color="#c2185b" /><Text style={styles.errorText}>{errors.description}</Text></View> : null}
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={wp(16)} color="#C17C74" style={{ marginRight: wp(8) }} />
              <TextInput style={styles.locationInput} placeholder="e.g. Cairo, Egypt" placeholderTextColor="#888888" value={location} onChangeText={setLocation} />
            </View>
          </>
        )}

        <View style={styles.divider} />
        {isMarketplace && (
          <View style={styles.marketTip}>
            <Ionicons name="information-circle-outline" size={wp(16)} color="#388e3c" />
            <Text style={styles.marketTipText}>Add a clear photo and fair price — listings with both sell 3× faster.</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btnAccent, isMarketplace && styles.btnAccentMarket, (saving || validatingImage) && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving || validatingImage} activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator size="small" color="white" style={{ marginRight: wp(8) }} /> : <Ionicons name={isMarketplace ? 'storefront-outline' : 'checkmark'} size={wp(16)} color="white" style={{ marginRight: wp(6) }} />}
          <Text style={styles.btnAccentText}>{saving ? 'Saving...' : validatingImage ? 'Validating image...' : isMarketplace ? 'Post to Marketplace' : 'Save to Wardrobe'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  logoHeader: { paddingBottom: hp(6), alignItems: 'center', backgroundColor: '#F5F5F5' },
  logo: { width: wp(120), height: hp(50) },
  modeWrap: { flexDirection: 'row', marginHorizontal: wp(16), marginBottom: hp(10), backgroundColor: '#F2E6E3', borderRadius: wp(14), padding: wp(4) },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: hp(10), borderRadius: wp(11) },
  modeBtnActive: { backgroundColor: '#C17C74' },
  modeBtnText: { fontSize: fp(13), fontWeight: '700', color: '#C17C74' },
  modeBtnTextActive: { color: 'white' },
  modeBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F2E6E3', marginHorizontal: wp(16), borderRadius: wp(12), padding: wp(10), marginBottom: hp(10) },
  modeBannerMarket: { backgroundColor: '#e8f5e9' },
  modeBannerText: { flex: 1, fontSize: fp(12), color: '#C17C74', lineHeight: hp(17) },
  modeBannerTextMarket: { color: '#388e3c' },
  scrollContent: { paddingBottom: hp(60) },
  uploadZone: { margin: wp(16), marginTop: hp(8), backgroundColor: '#F2E6E3', borderWidth: 1.5, borderColor: '#C17C74', borderStyle: 'dashed', borderRadius: wp(20), paddingVertical: hp(32), alignItems: 'center', gap: hp(10) },
  uploadZoneMarket: { borderColor: '#388e3c', backgroundColor: '#f1f8f2' },
  previewImage: { width: '100%', height: hp(220), borderRadius: wp(18) },
  uploadIconCircle: { width: wp(60), height: wp(60), borderRadius: wp(30), backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: fp(14), fontWeight: '600', color: '#C17C74' },
  uploadSub: { fontSize: fp(11), color: '#888888' },
  validationRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8), borderRadius: wp(12), padding: wp(10), marginHorizontal: wp(16), marginBottom: hp(8) },
  validatingText: { fontSize: fp(12), color: '#888888' },
  validationText: { flex: 1, fontSize: fp(12), fontWeight: '600' },
  photoRow: { flexDirection: 'row', gap: wp(10), paddingHorizontal: wp(16), marginBottom: hp(4) },
  btnOutlineHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#C17C74', borderRadius: wp(14), paddingVertical: hp(12) },
  btnOutlineText: { color: '#C17C74', fontSize: fp(13), fontWeight: '600' },
  divider: { height: 0.5, backgroundColor: 'rgba(193,124,116,0.18)', marginHorizontal: wp(16), marginVertical: hp(12) },
  sectionLabel: { fontSize: fp(11), fontWeight: '700', color: '#C17C74', paddingHorizontal: wp(16), paddingBottom: hp(8), textTransform: 'uppercase', letterSpacing: 0.9 },
  formGroup: { paddingHorizontal: wp(16), marginBottom: hp(12) },
  formRow: { flexDirection: 'row', gap: wp(10), paddingHorizontal: wp(16), marginBottom: hp(12) },
  formHalf: { flex: 1 },
  formLabel: { fontSize: fp(10), fontWeight: '700', color: '#C17C74', marginBottom: hp(6), textTransform: 'uppercase', letterSpacing: 0.6 },
  formInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e0c8c5', borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: hp(11), fontSize: fp(14), color: '#2c2c2c' },
  formInputRequired: { borderColor: '#C17C74' },
  inputError: { borderColor: '#c2185b', backgroundColor: '#fce4ec' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: hp(5) },
  errorText: { fontSize: fp(11), color: '#c2185b', fontWeight: '600', flex: 1 },
  textArea: { height: hp(100), paddingTop: hp(13) },
  locationRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#e0c8c5', borderRadius: wp(12), paddingHorizontal: wp(14), marginHorizontal: wp(16), marginBottom: hp(12) },
  locationInput: { flex: 1, paddingVertical: hp(11), fontSize: fp(14), color: '#2c2c2c' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), paddingHorizontal: wp(16), paddingBottom: hp(4) },
  tag: { paddingHorizontal: wp(14), paddingVertical: hp(7), borderRadius: wp(14), backgroundColor: '#F2E6E3', borderWidth: 1, borderColor: 'rgba(193,124,116,0.18)' },
  tagActive: { backgroundColor: '#C17C74', borderColor: '#C17C74' },
  tagText: { fontSize: fp(12), color: '#C17C74', fontWeight: '500' },
  tagTextActive: { color: 'white' },
  sizeHint: { fontSize: fp(11), color: '#888', fontStyle: 'italic', paddingHorizontal: wp(16), marginBottom: hp(8) },
  autoSizeNote: { flexDirection: 'row', alignItems: 'center', gap: wp(8), backgroundColor: '#F2E6E3', marginHorizontal: wp(16), borderRadius: wp(12), paddingHorizontal: wp(14), paddingVertical: hp(12) },
  autoSizeText: { fontSize: fp(13), color: '#C17C74', fontWeight: '600' },
  marketTip: { flexDirection: 'row', alignItems: 'flex-start', gap: wp(8), backgroundColor: '#e8f5e9', marginHorizontal: wp(16), borderRadius: wp(12), padding: wp(12), marginBottom: hp(4) },
  marketTipText: { flex: 1, fontSize: fp(12), color: '#2e7d32', lineHeight: hp(18) },
  btnAccent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#C17C74', marginHorizontal: wp(16), marginTop: hp(12), marginBottom: hp(10), borderRadius: wp(16), paddingVertical: hp(16) },
  btnAccentMarket: { backgroundColor: '#388e3c' },
  btnAccentText: { color: 'white', fontSize: fp(15), fontWeight: '600' },
});