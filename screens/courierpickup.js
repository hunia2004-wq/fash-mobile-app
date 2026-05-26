import React, { useState } from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { submitCourierPickup } from '../services/authService';


// ── Theme ─────────────────────────────────────────
const C = {
  bg: '#F5F5F5',
  white: '#FFFFFF',
  accent: '#C17C74',
  accentLight: '#F6E9E6',
  accentBorder: 'rgba(193,124,116,0.25)',
  text: '#1C1C1E',
  muted: '#8E8E93',
  border: '#E5E5EA',
  success: '#34C759',
  danger: '#FF3B30',
};

// ── API ───────────────────────────────────────────

// ── Main Screen ──────────────────────────────────
export default function CourierPickupScreen({ navigation }) {

  const [loading, setLoading] = useState(false);

  const [orderId, setOrderId] = useState('');
  const [itemId, setItemId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [courierName, setCourierName] = useState('');
  const [courierNotes, setCourierNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  const [errors, setErrors] = useState({});

  // ── Validation ────────────────────────────────
  function validate() {
    const e = {};

    if (!orderId.trim()) {
      e.orderId = 'Order ID is required';
    }

    if (!itemId.trim()) {
      e.itemId = 'Item ID is required';
    }

    if (!sellerId.trim()) {
      e.sellerId = 'Seller ID is required';
    }

    if (!courierName.trim()) {
      e.courierName = 'Courier name is required';
    }

    if (!photo) {
      e.photo = 'Please upload item photo';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  // ── Pick Photo ────────────────────────────────
  async function pickPhoto(source) {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Needed',
        `Please allow ${source} access`
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          });

    if (!result.canceled && result.assets?.[0]) {
      setPhoto(result.assets[0]);

      setErrors(prev => ({
        ...prev,
        photo: null,
      }));
    }
  }

  // ── Submit ────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
  
    try {
      const token = await SecureStore.getItemAsync('courierToken');
      console.log('courierToken:', token);
  
      await submitCourierPickup(token, {
        orderId: orderId.trim(),
        itemId: itemId.trim(),
        sellerId: sellerId.trim(),
        courierName: courierName.trim(),
        notes: courierNotes.trim(),
        photoUri: photo?.uri,
      });
  
      navigation.navigate('CourierStatusScreen', {
        orderId: orderId.trim(),
        status: 'pending_review',
      });
  
    } catch (err) {
      Alert.alert('Submission Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Courier Pickup</Text>
          <Text style={styles.headerSub}>
            Submit pickup request
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="truck-delivery-outline"
            size={20}
            color={C.accent}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Order ID */}
          <Text style={styles.label}>Order ID</Text>

          <TextInput
            style={styles.input}
            placeholder="ORD-123"
            value={orderId}
            onChangeText={setOrderId}
          />

          {errors.orderId && (
            <Text style={styles.error}>{errors.orderId}</Text>
          )}

          {/* Item ID */}
          <Text style={styles.label}>Item ID</Text>

          <TextInput
            style={styles.input}
            placeholder="ITEM-123"
            value={itemId}
            onChangeText={setItemId}
          />

          {errors.itemId && (
            <Text style={styles.error}>{errors.itemId}</Text>
          )}

          {/* Seller ID */}
          <Text style={styles.label}>Seller ID</Text>

          <TextInput
            style={styles.input}
            placeholder="SELLER-123"
            value={sellerId}
            onChangeText={setSellerId}
          />

          {errors.sellerId && (
            <Text style={styles.error}>{errors.sellerId}</Text>
          )}

          {/* Courier Name */}
          <Text style={styles.label}>Courier Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            value={courierName}
            onChangeText={setCourierName}
          />

          {errors.courierName && (
            <Text style={styles.error}>{errors.courierName}</Text>
          )}

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>

          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Optional notes..."
            multiline
            value={courierNotes}
            onChangeText={setCourierNotes}
          />

          {/* Photo */}
          <Text style={styles.label}>Item Photo</Text>

          <TouchableOpacity
            style={styles.photoBox}
            onPress={() => pickPhoto('gallery')}
          >
            {photo ? (
              <Image
                source={{ uri: photo.uri }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Feather name="image" size={36} color={C.accent} />
                <Text style={styles.photoText}>
                  Upload Item Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {errors.photo && (
            <Text style={styles.error}>{errors.photo}</Text>
          )}

          {/* Buttons */}
          <View style={styles.actionRow}>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => pickPhoto('camera')}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={C.accent}
              />

              <Text style={styles.secondaryBtnText}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    Submit Pickup
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={C.white}
                  />
                </>
              )}
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },

  headerSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: C.text,
  },

  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  error: {
    color: C.danger,
    fontSize: 12,
    marginTop: 5,
  },

  photoBox: {
    marginTop: 8,
    height: 220,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.accent,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.white,
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  photoPlaceholder: {
    alignItems: 'center',
  },

  photoText: {
    marginTop: 10,
    fontSize: 14,
    color: C.accent,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 12,
  },

  secondaryBtn: {
    flex: 0.35,
    borderWidth: 1.5,
    borderColor: C.accent,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  secondaryBtnText: {
    color: C.accent,
    fontWeight: '600',
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryBtnText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 15,
  },
});