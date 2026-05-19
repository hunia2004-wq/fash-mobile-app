import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getCards, addCard, updateCard, setDefaultCard, deleteCard, } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';


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
    setLoading(true);
    try {
      const token = await getToken();
      const res = await getCards(token);

      console.log("FETCH RESPONSE:", res);

      setCards(Array.isArray(res) ? res : []);
    } catch (e) {
      console.log("FETCH ERROR:", e);
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
    setCardHolder(card.cardholderName || '');
    setCardNumber('');
    setExpiry(`${card.expiryMonth}/${card.expiryYear?.slice(-2) || ''}`);
    setEditingId(card._id);
    setShowForm(true);
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    return cleaned.length >= 2
      ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
      : cleaned;
  };

  const handleSave = async () => {
    console.log("SAVE CLICKED");

    if (!cardHolder || !cardNumber || !expiry) {
      Alert.alert('Validation', 'Please fill all fields.');
      return;
    }

    const parts = expiry.split('/');
    if (parts.length !== 2) {
      Alert.alert('Error', 'Expiry must be MM/YY');
      return;
    }

    const [month, year] = parts;

    setSaving(true);

    try {
      const token = await getToken();

      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const last4 = cleanedNumber.slice(-4);

      const payload = {
        cardholderName: cardHolder.trim(),
        last4,
        brand: 'Visa',
        expiryMonth: month,
        expiryYear: `20${year}`,
      };
      console.log("PAYLOAD SENT:", payload);


      if (editingId) {
        await updateCard(token, editingId, payload);
        console.log("UPDATING CARD:", editingId);

      } else {
        console.log("ADDING CARD");
        await addCard(token, payload);
      }

      console.log("SUCCESS");
      await fetchCards();
      resetForm();
    } catch {
      Alert.alert('Error', 'Failed to save card.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = await getToken();

      console.log("SETTING DEFAULT FOR:", id);

      await setDefaultCard(token, id);

      console.log("DEFAULT SET SUCCESS");

      await fetchCards();
    } catch (e) {
      console.log("SET DEFAULT ERROR:", e);
      Alert.alert('Error', e.message || 'Failed to set default card.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Card', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await deleteCard(token, id);
            setCards((prev) => prev.filter((c) => c._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete card.');
          }
        },
      },
    ]);
  };

  const getCardIcon = (type = '') => {
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

        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#C17C74" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Cards</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* FORM */}
        {showForm && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>
              {editingId ? 'Edit Card' : 'New Card'}
            </Text>

            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Name on card"
              placeholderTextColor="#B09090"
            />

            <Text style={styles.fieldLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={19}
              placeholderTextColor="#B09090"
            />

            <Text style={styles.fieldLabel}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              placeholderTextColor="#B09090"
            />

            <View style={styles.formActions}>
              <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* LIST */}
        {!loading && cards.length === 0 && !showForm ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No cards saved</Text>
            <Text style={styles.emptySubtitle}>Add a card for faster checkout</Text>

            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={{ color: '#fff' }}>Add Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {cards.map((card) => (
              <View key={card._id} style={styles.cardItem}>
                <Text style={styles.cardType}>{getCardIcon(card.brand)}</Text>

                {card.isDefault && (
                  <Text style={styles.defaultBadge}>Default</Text>
                )}

                <Text style={styles.cardHolder}>{card.cardholderName}</Text>

                <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>

                <Text style={styles.cardExpiry}>
                  Expires {card.expiryMonth}/{card.expiryYear?.slice(-2)}
                </Text>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(card)}>
                    <Text style={styles.edit}>Edit</Text>
                  </TouchableOpacity>

                  {!card.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(card._id)}>
                      <Text style={styles.default}>Set Default</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => handleDelete(card._id)}>
                    <Text style={styles.delete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* INFO BOX */}
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fieldLabel: {
    fontSize: 11,
    color: 'black',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'relative',
  },

  backBtn: {
    fontSize: 28,
    color: '#C17C74',
    lineHeight: 32,
  },

  backBtnWrap: {
    padding: 8,
    zIndex: 10,
  },

  infoBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C17C74',
  },

  infoText: {
    color: '#C17C74',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,

  },

  headerTitle: {
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#C17C74',
  },

  addBtn: {
    fontSize: 15,
    color: '#C17C74',
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'black',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  input: {
    fontSize: 15,
    color: '#2C1F1F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(140,100,100,0.25)',
    paddingVertical: 10,
    marginBottom: 12,
  },

  formActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C17C74',
    alignItems: 'center',
  },

  cancelText: {
    color: '#C17C74',
    fontWeight: '600',
    fontSize: 14,
  },

  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#C17C74',
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* LIST ITEM */
  cardItem: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },

  cardType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C1F1F',
    marginBottom: 4,
  },

  defaultBadge: {
    backgroundColor: '#C17C74',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  cardHolder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1F1F',
  },

  cardNumber: {
    fontSize: 13,
    color: '#7A6060',
    marginTop: 2,
    letterSpacing: 1,
  },

  cardExpiry: {
    fontSize: 12,
    color: '#7A6060',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },

  edit: {
    fontSize: 13,
    color: '#C17C74',
    fontWeight: '600',
  },

  default: {
    fontSize: 13,
    color: '#5A8B6A',
    fontWeight: '600',
  },

  delete: {
    fontSize: 13,
    color: '#C0444A',
    fontWeight: '600',
  },

  /* EMPTY STATE */
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C1F1F',
    marginBottom: 10,
  },

  emptySubtitle: {
    color: 'gray',
    marginBottom: 20,
  },

  emptyBtn: {
    backgroundColor: '#C17C74',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
});