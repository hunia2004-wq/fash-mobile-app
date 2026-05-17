import React, { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, StatusBar, Dimensions, Image, Alert, ActivityIndicator} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createWardrobeItem } from '../../services/authService';


const { width } = Dimensions.get('window');

const SEASONS   = ['Spring', 'Summer', 'Autumn', 'Winter', 'All-season'];
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

export default function UploadScreen({ navigation }) {
  const { getToken } = useAuth();

  const [itemName, setItemName] = useState('');
  const [size, setSize] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [seasons, setSeasons] = useState(['Spring']);
  const [occasions, setOccasions] = useState(['Casual']);
  const [category, setCategory] = useState('Dresses');
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [listOnMarketplace, setListOnMarketplace] = useState(false);

  const resetForm = () => {
    setItemName('');
    setSize('');
    setBrand('');
    setPrice('');
    setSeasons(['Spring']);
    setOccasions(['Casual']);
    setCategory('Dresses');
    setImageUri(null);
    setListOnMarketplace(false);
  };

  const toggle = (setter, current, val) =>
    setter(current.includes(val) ? current.filter(v => v !== val) : [...current, val]);

  const pickImage = async (fromCamera = false) => {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in your device settings to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photo Library Access Required',
          'Please enable photo library access in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      Alert.alert('Missing info', 'Please enter an item name.');
      return;
    }
    if (!category) {
      Alert.alert('Missing info', 'Please select a category.');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();

      const formData = new FormData();
      formData.append('name', itemName.trim());
      formData.append('category', category);
      if (size)    formData.append('size', size);
      if (brand)   formData.append('brand', brand);
      if (price)   formData.append('price', price);
      if (seasons.length)   formData.append('season', seasons[0]);
      if (occasions.length) formData.append('occasion', occasions[0]);
      formData.append('listOnMarketplace', listOnMarketplace ? 'true' : 'false');

      if (imageUri) {
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'item.jpg',
        });
      }

      await createWardrobeItem(token, formData);

      Alert.alert(
        'Saved!',
        listOnMarketplace
          ? 'Item added to your wardrobe and listed on the Marketplace.'
          : 'Item added to your wardrobe.',
        [
          {
            text: 'Add Another',
            onPress: resetForm,
          },
          {
            text: 'Go to Wardrobe',
            onPress: () => navigation.navigate('WardrobeTab'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor='white' />

      {/* Logo */}
      <View style={styles.logoHeader}>
        <Image
          source={require('../../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.titleHeader}>
        <Text style={styles.headerTitle}>Add to Wardrobe</Text>
        <Text style={styles.headerSub}>Upload a photo or fill in details</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Upload zone */}
        <TouchableOpacity style={styles.uploadZone} activeOpacity={0.8} onPress={() => pickImage(false)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.uploadIconCircle}>
                <Feather name="camera" size={28} color='#C17C74' />
              </View>
              <Text style={styles.uploadText}>Tap to upload photo</Text>
              <Text style={styles.uploadSub}>JPG, PNG, HEIC supported</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8} onPress={() => pickImage(true)}>
            <Ionicons name="camera-outline" size={15} color='#C17C74' style={{ marginRight: 5 }} />
            <Text style={styles.btnOutlineText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutlineHalf} activeOpacity={0.8} onPress={() => pickImage(false)}>
            <Ionicons name="images-outline" size={15} color='#C17C74' style={{ marginRight: 5 }} />
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
            placeholderTextColor='#888888'
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
              placeholderTextColor='#888888'
              value={size}
              onChangeText={setSize}
            />
          </View>
          <View style={styles.formHalf}>
            <Text style={styles.formLabel}>Price (optional)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="EGP 0.00"
              placeholderTextColor='#888888'
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
            placeholderTextColor='#888888'
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={styles.divider} />

        {/* Category */}
        <Text style={styles.sectionLabel}>Category *</Text>
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

        {/* Occasion */}
        <Text style={styles.sectionLabel}>Occasion</Text>
        <TagRow
          options={OCCASIONS}
          selected={occasions}
          onToggle={val => toggle(setOccasions, occasions, val)}
        />

        <View style={styles.divider} />

        {/* Marketplace toggle */}
        <TouchableOpacity
          style={[styles.btnOutlineFull, listOnMarketplace && { backgroundColor: '#F2E6E3' }]}
          onPress={() => setListOnMarketplace(prev => !prev)}
          activeOpacity={0.8}
        >
          <Feather
            name={listOnMarketplace ? 'check-square' : 'square'}
            size={15}
            color='#C17C74'
            style={{ marginRight: 6 }}
          />
          <Text style={styles.btnOutlineText}>Also list on Marketplace</Text>
        </TouchableOpacity>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.btnAccent, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          ) : (
            <Feather name="check" size={16} color="white" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.btnAccentText}>
            {listOnMarketplace ? 'Save & List on Marketplace' : 'Save to Wardrobe'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#F5F5F5'
  },

  logoHeader: {
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  
  logo: {
    width: 120,
    height: 50,
  },
  
  titleHeader: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#C17C74',
  },
  
  headerSub: { 
    fontSize: 13, 
    color: '#888888', 
    marginTop: 2 
  },

  scrollContent: { 
    paddingBottom: 20 
  },

  uploadZone: {
    margin: 16,
    backgroundColor: '#F2E6E3',
    borderWidth: 1.5,
    borderColor: '#C17C74',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },

  previewImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 18 
  },

  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#C17C74' 
  },

  uploadSub: { 
    fontSize: 11, 
    color: '#888888'
  },

  photoRow: { 
    flexDirection: 'row', 
    gap: 10, 
    paddingHorizontal: 16, 
    marginBottom: 4 
  },

  btnOutlineHalf: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5, 
    borderColor: '#C17C74', 
    borderRadius: 14, 
    paddingVertical: 12,
  },

  btnOutlineText: { 
    color: '#C17C74', 
    fontSize: 13, 
    fontWeight: '600' 
  },

  divider: { 
    height: 0.5, 
    backgroundColor: 'rgba(193,124,116,0.18)', 
    marginHorizontal: 16, 
    marginVertical: 12 
  },

  sectionLabel: {
    fontSize: 11, 
    fontWeight: '700', 
    color: '#C17C74',
    paddingHorizontal: 16, 
    paddingBottom: 8,
    textTransform: 'uppercase', 
    letterSpacing: 0.9,
  },

  formGroup: { 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },

  formRow: { 
    flexDirection: 'row', 
    gap: 10, 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },

  formHalf: { 
    flex: 1 
  },

  formLabel: {
    fontSize: 10, 
    fontWeight: '700', 
    color: '#C17C74',
    marginBottom: 6, 
    textTransform: 'uppercase', 
    letterSpacing: 0.6,
  },

  formInput: {
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: '#e0c8c5',
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 11,
    fontSize: 14, 
    color: '#2c2c2c',
  },

  tagRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    paddingHorizontal: 16, 
    paddingBottom: 4 
  },

  tag: {
    paddingHorizontal: 14, 
    paddingVertical: 7, 
    borderRadius: 14,
    backgroundColor: '#F2E6E3', 
    borderWidth: 1, 
    borderColor: 'rgba(193,124,116,0.18)',
  },

  tagActive: { 
    backgroundColor: '#C17C74', 
    borderColor: '#C17C74', 
  },

  tagText: { 
    fontSize: 12, 
    color: '#C17C74', 
    fontWeight: '500' 
  },

  tagTextActive: { 
    color: 'white',
  },

  btnAccent: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#C17C74',
    marginHorizontal: 16, 
    marginTop: 12, 
    marginBottom: 10,
    borderRadius: 16, 
    paddingVertical: 16,
  },

  btnAccentText: { 
    color: 'white', 
    fontSize: 15, 
    fontWeight: '600' 
  },

  btnOutlineFull: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5, 
    borderColor: '#C17C74',
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 16, 
    paddingVertical: 15,
  },
});