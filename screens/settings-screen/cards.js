import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getCards, addCard, updateCard, setDefaultCard, deleteCard } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';
import { useTranslation } from 'react-i18next';

export default function SavedCards({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const { t } = useTranslation();
  const [cards,      setCards]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');

  useEffect(() => { fetchCards(); }, []);

  const fetchCards = async () => {
    setLoading(true);
    try { const token = await getToken(); const res = await getCards(token); setCards(Array.isArray(res) ? res : []); }
    catch (e) { Alert.alert(t('error'), t('cards_load_failed')); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setCardHolder(''); setCardNumber(''); setExpiry(''); setEditingId(null); setShowForm(false); };
  const openEdit = (card) => { setCardHolder(card.cardholderName || ''); setCardNumber(''); setExpiry(`${card.expiryMonth}/${card.expiryYear?.slice(-2) || ''}`); setEditingId(card._id); setShowForm(true); };
  const formatCardNumber = (text) => { const cleaned = text.replace(/\D/g, '').slice(0, 16); return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned; };
  const formatExpiry = (text) => { const cleaned = text.replace(/\D/g, '').slice(0, 4); return cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned; };

  const handleSave = async () => {
    if (!cardHolder || !cardNumber || !expiry) { Alert.alert(t('validation'), t('fill_all_fields')); return; }
    const parts = expiry.split('/');
    if (parts.length !== 2) { Alert.alert(t('error'), t('expiry_format')); return; }
    const [month, year] = parts;
    setSaving(true);
    try {
      const token = await getToken();
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const last4 = cleanedNumber.slice(-4);
      const payload = { cardholderName: cardHolder.trim(), last4, brand: 'Visa', expiryMonth: month, expiryYear: `20${year}` };
      if (editingId) { await updateCard(token, editingId, payload); } else { await addCard(token, payload); }
      await fetchCards(); resetForm();
    } catch { Alert.alert(t('error'), t('card_save_failed')); }
    finally { setSaving(false); }
  };

  const handleSetDefault = async (id) => {
    try { const token = await getToken(); await setDefaultCard(token, id); await fetchCards(); }
    catch (e) { Alert.alert(t('error'), e.message || t('card_default_failed')); }
  };

  const handleDelete = (id) => {
    Alert.alert(t('card_delete_title'), t('are_you_sure'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => {
        try { const token = await getToken(); await deleteCard(token, id); setCards(prev => prev.filter(c => c._id !== id)); }
        catch { Alert.alert(t('error'), t('card_delete_failed')); }
      }},
    ]);
  };

  const getCardIcon = (type = '') => { const t = type.toLowerCase(); if (t.includes('visa')) return '💳 Visa'; if (t.includes('master')) return '💳 Mastercard'; if (t.includes('amex')) return '💳 Amex'; return '💳'; };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('settings_cards')}</Text>
          <View style={{ width: wp(40) }} />
        </View>
        <View style={styles.loader}><ActivityIndicator size="large" color="#C17C74" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings_cards')}</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtn}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {showForm && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>{editingId ? t('edit_card') : t('new_card')}</Text>
            <Text style={styles.fieldLabel}>{t('cardholder_name')}</Text>
            <TextInput style={styles.input} value={cardHolder} onChangeText={setCardHolder} placeholder={t('name_on_card')} placeholderTextColor="#B09090" />
            <Text style={styles.fieldLabel}>{t('card_number')}</Text>
            <TextInput style={styles.input} value={cardNumber} onChangeText={(t) => setCardNumber(formatCardNumber(t))} placeholder="0000 0000 0000 0000" keyboardType="numeric" maxLength={19} placeholderTextColor="#B09090" />
            <Text style={styles.fieldLabel}>{t('expiry_date')}</Text>
            <TextInput style={styles.input} value={expiry} onChangeText={(t) => setExpiry(formatExpiry(t))} placeholder="MM/YY" keyboardType="numeric" maxLength={5} placeholderTextColor="#B09090" />
            <View style={styles.formActions}>
              <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}><Text style={styles.cancelText}>{t('cancel')}</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{t('save')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!loading && cards.length === 0 && !showForm ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>{t('no_cards')}</Text>
            <Text style={styles.emptySubtitle}>{t('no_cards_sub')}</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: fp(14) }}>{t('add_card')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {cards.map((card) => (
              <View key={card._id} style={styles.cardItem}>
                <Text style={styles.cardType}>{getCardIcon(card.brand)}</Text>
                {card.isDefault && <Text style={styles.defaultBadge}>{t('default')}</Text>}
                <Text style={styles.cardHolder}>{card.cardholderName}</Text>
                <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                <Text style={styles.cardExpiry}>{t('expires')} {card.expiryMonth}/{card.expiryYear?.slice(-2)}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(card)}><Text style={styles.edit}>{t('edit')}</Text></TouchableOpacity>
                  {!card.isDefault && <TouchableOpacity onPress={() => handleSetDefault(card._id)}><Text style={styles.default}>{t('set_default')}</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => handleDelete(card._id)}><Text style={styles.delete}>{t('delete')}</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{t('card_security_info')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  addBtn: { fontSize: fp(15), color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: wp(16), paddingBottom: hp(40) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), padding: wp(16), marginBottom: hp(14) },
  cardSectionLabel: { fontSize: fp(11), fontWeight: '700', color: 'black', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: hp(14) },
  fieldLabel: { fontSize: fp(11), color: 'black', marginBottom: hp(6), fontWeight: '600', textTransform: 'uppercase' },
  input: { fontSize: fp(15), color: '#2C1F1F', borderBottomWidth: 1, borderBottomColor: 'rgba(140,100,100,0.25)', paddingVertical: hp(10), marginBottom: hp(12) },
  formActions: { flexDirection: 'row', gap: wp(10), marginTop: hp(10) },
  cancelBtn: { flex: 1, padding: hp(12), borderRadius: wp(12), borderWidth: 1.5, borderColor: '#C17C74', alignItems: 'center' },
  cancelText: { color: '#C17C74', fontWeight: '600', fontSize: fp(14) },
  saveBtn: { flex: 1, padding: hp(12), borderRadius: wp(12), backgroundColor: '#C17C74', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: fp(14) },
  cardItem: { paddingVertical: hp(14), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  cardType: { fontSize: fp(14), fontWeight: '700', color: '#2C1F1F', marginBottom: hp(4) },
  defaultBadge: { backgroundColor: '#C17C74', paddingHorizontal: wp(8), paddingVertical: hp(2), borderRadius: wp(10), alignSelf: 'flex-start', marginBottom: hp(6), color: '#fff', fontSize: fp(10), fontWeight: '700' },
  cardHolder: { fontSize: fp(14), fontWeight: '600', color: '#2C1F1F' },
  cardNumber: { fontSize: fp(13), color: '#7A6060', marginTop: hp(2), letterSpacing: 1 },
  cardExpiry: { fontSize: fp(12), color: '#7A6060', marginTop: hp(2) },
  actions: { flexDirection: 'row', gap: wp(16), marginTop: hp(10) },
  edit: { fontSize: fp(13), color: '#C17C74', fontWeight: '600' },
  default: { fontSize: fp(13), color: '#5A8B6A', fontWeight: '600' },
  delete: { fontSize: fp(13), color: '#C0444A', fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', paddingTop: hp(60) },
  emptyIcon: { fontSize: fp(48), marginBottom: hp(10) },
  emptyTitle: { fontSize: fp(18), fontWeight: '700', color: '#2C1F1F', marginBottom: hp(10) },
  emptySubtitle: { color: 'gray', marginBottom: hp(20), fontSize: fp(13) },
  emptyBtn: { backgroundColor: '#C17C74', paddingHorizontal: wp(28), paddingVertical: hp(12), borderRadius: wp(20) },
  infoBox: { marginTop: hp(20), padding: wp(14), borderRadius: wp(12), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { color: '#C17C74', fontSize: fp(14), fontWeight: '600', lineHeight: hp(22) },
});