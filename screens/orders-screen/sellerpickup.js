import React, { useState, useCallback } from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, Image,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#F5F5F5',
  card: '#F2E6E3',
  button: '#C17C74',
  buttonText: '#FFFFFF',
  text: '#2C1810',
  textSecondary: '#7A5C58',
  textTertiary: '#B08D89',
  border: '#E0CECA',
  inputBg: '#FFFFFF',
  noteBackground: '#FDF6F5',
  noteBorder: '#E0CECA',
  success: '#4CAF50',
  white: '#FFFFFF',
  selectedSlot: '#C17C74',
  unselectedSlot: '#FFFFFF',
  divider: '#E8D8D5',
};

const TIME_SLOTS = [
  '8:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
];

// Generate next 8 days from today
function getUpcomingDays() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: i === 0 ? 'Today' : dayNames[d.getDay()],
      date: d.getDate(),
      fullDate: d.toISOString().split('T')[0],
    });
  }
  return days;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function FormField({ label, children }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ItemCard({ item, buyerUsername, readOnly }) {
  return (
    <View style={styles.itemCard}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.itemThumb} />
      ) : (
        <View style={[styles.itemThumb, styles.itemThumbPlaceholder]}>
          <Ionicons name="shirt-outline" size={22} color={COLORS.button} />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemBuyer}>Bought by @{buyerUsername}</Text>
        <View style={styles.statusPill}>
          <Ionicons
            name={readOnly ? 'checkmark-circle' : 'time-outline'}
            size={11}
            color={readOnly ? COLORS.success : COLORS.button}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.statusPillText, readOnly && { color: COLORS.success }]}>
            {readOnly ? 'Pickup scheduled' : 'Awaiting pickup'}
          </Text>
        </View>
      </View>
      <Text style={styles.itemPrice}>EGP {item.price}</Text>
    </View>
  );
}

function DatePicker({ selectedDate, onSelect }) {
  const days = getUpcomingDays();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePicker}>
      {days.map((d) => {
        const isSelected = selectedDate === d.fullDate;
        return (
          <TouchableOpacity
            key={d.fullDate}
            onPress={() => onSelect(d.fullDate)}
            style={[styles.dateChip, isSelected && styles.dateChipSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateChipDay, isSelected && styles.dateChipDaySelected]}>
              {d.label}
            </Text>
            <Text style={[styles.dateChipNum, isSelected && styles.dateChipNumSelected]}>
              {d.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function TimeSlotGrid({ selectedSlot, onSelect, disabled }) {
  return (
    <View style={styles.slotGrid}>
      {TIME_SLOTS.map((slot) => {
        const isSelected = selectedSlot === slot;
        return (
          <TouchableOpacity
            key={slot}
            onPress={() => !disabled && onSelect(slot)}
            style={[
              styles.slotChip,
              isSelected && styles.slotChipSelected,
              disabled && styles.slotChipDisabled,
            ]}
            activeOpacity={disabled ? 1 : 0.7}
          >
            <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
              {slot}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AuthNote() {
  return (
    <View style={styles.noteCard}>
      <View style={styles.noteIconWrapper}>
        <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.button} />
      </View>
      <View style={styles.noteBody}>
        <Text style={styles.noteTitle}>Authentication & condition check</Text>
        <Text style={styles.noteText}>
        A courier will collect the item and send photos to our admin for authenticity
        and condition verification. Only the delivery fee is charged at this stage.
        </Text>
      </View>
    </View>
  );
}

function ReadOnlyBanner() {
  return (
    <View style={styles.readOnlyBanner}>
      <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
      <Text style={styles.readOnlyText}>Pickup details submitted successfully</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SellerPickupScreen({ route, navigation }) {
  const {
    orderId = 'EA4E1D',
    item = { name: 'Item', price: 0, imageUrl: null },
    buyerUsername = 'buyer',
    readOnly = false,
  } = route?.params ?? {};

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedDate, setSelectedDate] = useState(getUpcomingDays()[0].fullDate);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing field', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing field', 'Please enter your phone number.');
      return;
    }
    if (!street.trim() || !city.trim()) {
      Alert.alert('Missing field', 'Please complete your pickup address.');
      return;
    }

    setSubmitting(true);

    // TODO: replace with your actual API call
    // await api.post('/orders/${orderId}/pickup', {
    //   fullName, phone, street, city, postalCode,
    //   instructions, pickupDate: selectedDate, pickupSlot: selectedSlot,
    // });

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Pickup confirmed!',
        'We will dispatch a courier to collect your item.',
        [{ text: 'OK', onPress: () => navigation?.goBack() }]
      );
    }, 1200);
  }, [fullName, phone, street, city, postalCode, instructions, selectedDate, selectedSlot, orderId, navigation]);

  const inputStyle = (disabled) => [
    styles.input,
    disabled && styles.inputDisabled,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup Information</Text>
        <View style={styles.headerRight}>
          <Text style={styles.orderIdText}>#{orderId}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Read-only banner ── */}
          {readOnly && <ReadOnlyBanner />}

          {/* ── Item sold ── */}
          <SectionLabel>ITEM SOLD</SectionLabel>
          <ItemCard item={item} buyerUsername={buyerUsername} readOnly={readOnly} />

          {/* ── Pickup address ── */}
          <SectionLabel>PICKUP ADDRESS</SectionLabel>
          <View style={styles.card}>
            <FormField label="Full name">
              <TextInput
                style={inputStyle(readOnly)}
                placeholder="Your full name"
                placeholderTextColor={COLORS.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                editable={!readOnly}
                autoCapitalize="words"
              />
            </FormField>

            <FormField label="Phone number">
              <TextInput
                style={inputStyle(readOnly)}
                placeholder="+20 10 0000 0000"
                placeholderTextColor={COLORS.textTertiary}
                value={phone}
                onChangeText={setPhone}
                editable={!readOnly}
                keyboardType="phone-pad"
              />
            </FormField>

            <FormField label="Street address">
              <TextInput
                style={inputStyle(readOnly)}
                placeholder="32 Maadi"
                placeholderTextColor={COLORS.textTertiary}
                value={street}
                onChangeText={setStreet}
                editable={!readOnly}
              />
            </FormField>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormField label="City">
                  <TextInput
                    style={inputStyle(readOnly)}
                    placeholder="Cairo"
                    placeholderTextColor={COLORS.textTertiary}
                    value={city}
                    onChangeText={setCity}
                    editable={!readOnly}
                  />
                </FormField>
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Postal code">
                  <TextInput
                    style={inputStyle(readOnly)}
                    placeholder="11511"
                    placeholderTextColor={COLORS.textTertiary}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    editable={!readOnly}
                    keyboardType="numeric"
                  />
                </FormField>
              </View>
            </View>

            <FormField label="Additional instructions (optional)">
              <TextInput
                style={[inputStyle(readOnly), styles.textarea]}
                placeholder="e.g. Ring bell 2, leave with doorman…"
                placeholderTextColor={COLORS.textTertiary}
                value={instructions}
                onChangeText={setInstructions}
                editable={!readOnly}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </FormField>
          </View>

          {/* ── Pickup date ── */}
          <SectionLabel>PREFERRED PICKUP DATE</SectionLabel>
          <View style={styles.card}>
            <DatePicker selectedDate={selectedDate} onSelect={readOnly ? () => {} : setSelectedDate} />
            <View style={styles.divider} />
            <Text style={styles.fieldLabel}>Time window</Text>
            <TimeSlotGrid
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              disabled={readOnly}
            />
          </View>

          {/* ── Auth note ── */}
          <AuthNote />

          {/* ── Submit or submitted ── */}
          {!readOnly ? (
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Ionicons name="cube-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Confirming…' : 'Confirm pickup details'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.submittedBlock}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginRight: 8 }} />
              <Text style={styles.submittedText}>Courier will be dispatched shortly</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.button,
    letterSpacing: 0.2,
  },
  headerRight: {
    width: 36,
    alignItems: 'flex-end',
  },
  orderIdText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  itemThumbPlaceholder: {
    backgroundColor: '#EDD6D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemBuyer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: '#EDD6D3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.button,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.button,
    marginLeft: 8,
  },

  fieldWrapper: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputDisabled: {
    backgroundColor: '#F8F0EE',
    color: COLORS.textSecondary,
  },
  textarea: {
    height: 80,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
  },

  datePicker: {
    marginBottom: 14,
  },
  dateChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
    minWidth: 52,
  },
  dateChipSelected: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  dateChipDay: {
    fontSize: 10,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  dateChipDaySelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateChipNum: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  dateChipNumSelected: {
    color: COLORS.white,
  },

  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  slotChip: {
    width: '30.5%',
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  slotChipSelected: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  slotChipDisabled: {
    opacity: 0.6,
  },
  slotText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  slotTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },

  noteCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.noteBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.noteBorder,
    padding: 14,
    marginBottom: 20,
  },
  noteIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EDD6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
    marginTop: 1,
  },
  noteBody: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.button,
    marginBottom: 5,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  submitBtn: {
    backgroundColor: COLORS.button,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  readOnlyText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  submittedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 8,
  },
  submittedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
});