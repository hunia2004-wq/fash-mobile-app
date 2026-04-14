import React, { useContext, useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import {getCards, addCard, updateCard, setDefaultCard, deleteCard,} from '../../services/authService';

export default function SavedCards({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = await getToken();
      const data = await getCards(token);
      console.log("CARDS RESPONSE:", data);
      setCards(Array.isArray(data) ? data : data.cards || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load cards.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardHolder('');
    setCardNumber('');
    setExpiry('');
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (card) => {
    setCardHolder(card.card_holder || card.cardHolder || '');
    setCardNumber(card.last4 ? `**** **** **** ${card.last4}` : '');
    setExpiry(card.expiry || card.expiry_date || '');
    setEditingId(card.id || card._id);
    setShowForm(true);
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handleSave = async () => {
    if (!cardHolder.trim() || !cardNumber.trim() || !expiry.trim()) {
      console.log("SAVING CARD:", payload);
      Alert.alert('Validation', 'Please fill in all card details.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const payload = {
        card_holder: cardHolder.trim(),
        card_number: cardNumber.replace(/\s/g, ''),
        expiry: expiry.trim(),
      };
      if (editingId) {
        await updateCard(token, editingId, payload);
      } else {
        await addCard(token, payload);
      }
      await fetchCards();
      resetForm();
    } catch (e) {
      console.log("CARD ERROR:", e);
      Alert.alert('Error', e.message || 'Failed to save card.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = await getToken();
      await setDefaultCard(token, id);
      await fetchCards();
    } catch (e) {
      Alert.alert('Error', 'Failed to set default card.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken();
            await deleteCard(token, id);
            setCards((prev) => prev.filter((c) => (c.id || c._id) !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete card.');
          }
        },
      },
    ]);
  };

  const getCardIcon = (type) => {
    if (!type) return '💳';
    const t = type.toLowerCase();
    if (t.includes('visa')) return '💳 Visa';
    if (t.includes('master')) return '💳 Mastercard';
    if (t.includes('amex')) return '💳 Amex';
    return '💳';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Cards</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#C17C74" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Cards</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Add / Edit Form */}
        {showForm && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>
              {editingId ? 'Edit Card' : 'New Card'}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Name on card"
                placeholderTextColor="#B09090"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#B09090"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={[styles.fieldGroup, styles.lastField]}>
              <Text style={styles.fieldLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={(t) => setExpiry(formatExpiry(t))}
                placeholder="MM/YY"
                placeholderTextColor="#B09090"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelFormBtn} onPress={resetForm}>
                <Text style={styles.cancelFormBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveFormBtn} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.saveFormBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Card List */}
        {cards.length === 0 && !showForm ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No cards saved</Text>
            <Text style={styles.emptySubtitle}>Add a card for faster checkout</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.emptyBtnText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {cards.map((card, index) => (
              <View
                key={card.id || card._id}
                style={[styles.cardItem, index < cards.length - 1 && styles.cardBorder]}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardType}>{getCardIcon(card.type || card.card_type)}</Text>
                    {(card.is_default || card.isDefault) && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardHolder}>{card.card_holder || card.cardHolder || 'Cardholder'}</Text>
                  <Text style={styles.cardNumber}>
                    **** **** **** {card.last4 || card.last_four || '••••'}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {card.expiry || card.expiry_date || '—'}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => openEdit(card)}>
                    <Text style={styles.editBtn}>Edit</Text>
                  </TouchableOpacity>
                  {!(card.is_default || card.isDefault) && (
                    <TouchableOpacity onPress={() => handleSetDefault(card.id || card._id)}>
                      <Text style={styles.defaultBtn}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(card.id || card._id)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your card details are encrypted and stored securely. We never store your full card number.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, position: 'relative' },
  backBtn: { fontSize: 28, color: '#C17C74', lineHeight: 32 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  addBtn: { fontSize: 15, color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12 },
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, padding: 16 },
  cardSectionLabel: { fontSize: 11, fontWeight: '700', color: '#7A6060', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14 },
  fieldGroup: { marginBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)', paddingBottom: 14 },
  lastField: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  fieldLabel: { fontSize: 11, color: '#7A6060', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: '#2C1F1F' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelFormBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#C17C74', alignItems: 'center' },
  cancelFormBtnText: { color: '#C17C74', fontWeight: '600', fontSize: 14 },
  saveFormBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#C17C74', alignItems: 'center' },
  saveFormBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cardItem: { paddingVertical: 14 },
  cardBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  cardLeft: { flex: 1, marginBottom: 10 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardType: { fontSize: 14, fontWeight: '700', color: '#2C1F1F' },
  defaultBadge: { backgroundColor: '#C17C74', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  defaultBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  cardHolder: { fontSize: 14, fontWeight: '600', color: '#2C1F1F' },
  cardNumber: { fontSize: 13, color: '#7A6060', marginTop: 2, letterSpacing: 1 },
  cardExpiry: { fontSize: 12, color: '#7A6060', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 16 },
  editBtn: { fontSize: 13, color: '#C17C74', fontWeight: '600' },
  defaultBtn: { fontSize: 13, color: '#5A8B6A', fontWeight: '600' },
  deleteBtn: { fontSize: 13, color: '#C0444A', fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2C1F1F', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#7A6060', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#C17C74', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: 13, color: '#C17C74', fontWeight: 'bold', lineHeight: 20 },
});