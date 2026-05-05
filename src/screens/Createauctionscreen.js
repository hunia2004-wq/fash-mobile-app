import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#F5F5F5',
  card: '#F2E6E3',
  accent: '#C17C74',
  accentLight: '#f7edec',
  text: '#2c2c2c',
  muted: '#888888',
  white: '#ffffff',
  border: 'rgba(193,124,116,0.18)',
};

const CATEGORIES = ['Shoes', 'Bags', 'Accessories', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const DURATIONS = ['1 hour', '3 hours', '6 hours', '12 hours', '24 hours', '3 days'];

const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const SelectPills = ({ options, value, onChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.pill, value === opt && styles.pillActive]}
        onPress={() => onChange(opt)}
        activeOpacity={0.8}
      >
        <Text style={[styles.pillText, value === opt && styles.pillTextActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default function CreateAuctionScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [size, setSize] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = title && category && condition && startingPrice && duration;

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    // TODO (Hunia & Aynour):
    // Connect this to your backend to create a real auction.
    // API Endpoint: POST /api/auctions
    // Auth: Bearer token
    // Request body:
    // {
    //   title, brand, description, category,
    //   condition, size, startingPrice: parseFloat(startingPrice),
    //   duration,   // e.g. "3 hours" — backend calculates endsAt
    //   userId: currentUser.id
    // }
    // Response: { success: true, auction: { id, ... } }

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Auction Created!',
        'Your auction is now live.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Auction</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Photo upload */}
          <TouchableOpacity style={styles.photoUpload} activeOpacity={0.8}>
            <View style={styles.photoIcon}>
              <Ionicons name="camera-outline" size={32} color={COLORS.accent} />
            </View>
            <Text style={styles.photoTitle}>Add Photos</Text>
            <Text style={styles.photoSub}>Up to 5 photos · First is cover</Text>
          </TouchableOpacity>

          {/* Form */}
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
            <SelectPills options={CATEGORIES} value={category} onChange={setCategory} />
          </Field>

          <Field label="Condition" required>
            <SelectPills options={CONDITIONS} value={condition} onChange={setCondition} />
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

          <Field label="Starting Price (USD)" required>
            <View style={styles.priceInput}>
              <Text style={styles.currencySign}>$</Text>
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
            <SelectPills options={DURATIONS} value={duration} onChange={setDuration} />
          </Field>

          {/* Info card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.accent} />
            <Text style={styles.infoText}>
              Your auction goes live immediately once submitted. Buyers can start bidding right away.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[styles.submitBtn, (!isValid || submitting) && { opacity: 0.45 }]}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="hammer-outline" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
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
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accent },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },

  photoUpload: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 32, gap: 6, marginBottom: 24 },
  photoIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  photoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  photoSub: { fontSize: 12, color: COLORS.muted },

  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: COLORS.accent },

  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: COLORS.text },
  textArea: { height: 100, paddingTop: 13 },

  priceInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14 },
  currencySign: { fontSize: 16, fontWeight: '700', color: COLORS.accent },

  pillsRow: { paddingVertical: 2, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  pillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  pillTextActive: { color: COLORS.white },

  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.accentLight, borderRadius: 14, padding: 14, marginTop: 4 },
  infoText: { flex: 1, fontSize: 13, color: COLORS.accent, lineHeight: 19 },

  ctaBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 16, paddingVertical: 16 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.white },
});
