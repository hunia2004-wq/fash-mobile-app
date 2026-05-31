import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

export default function SavedAddresses({ navigation }) {
  const { getToken } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      const res = await getAddresses(token);
      const data = res?.data?.data || res?.data || res || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) { console.log("ADDRESS ERROR:", e.message); }
    finally { setLoading(false); }
  };

  const resetForm = () => { setFullName(''); setPhone(''); setLabel(''); setStreet(''); setCity(''); setCountry(''); setEditingId(null); setShowForm(false); };

  const openEdit = (address) => { setFullName(address.fullName || ''); setPhone(address.phone || ''); setLabel(address.label || ''); setStreet(address.street || address.address || ''); setCity(address.city || ''); setCountry(address.country || ''); setEditingId(address._id); setShowForm(true); };

  const handleSave = async () => {
    if (!fullName.trim() || !phone.trim() || !label.trim() || !street.trim() || !city.trim() || !country.trim()) { Alert.alert('Validation', 'Please fill all required fields.'); return; }
    setSaving(true);
    try {
      const token = await getToken();
      const payload = { fullName: fullName.trim(), phone: phone.trim(), label: label.trim(), street: street.trim(), city: city.trim(), country: country.trim() };
      if (editingId) { await updateAddress(token, editingId, payload); } else { await addAddress(token, payload); }
      await fetchAddresses();
      resetForm();
    } catch (e) { Alert.alert('Error', e.message || 'Failed to save address.'); }
    finally { setSaving(false); }
  };

  const handleSetDefault = async (id) => {
    try { const token = await getToken(); await setDefaultAddress(token, id); await fetchAddresses(); }
    catch (e) { Alert.alert('Error', 'Failed to set default address.'); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { const token = await getToken(); await deleteAddress(token, id); setAddresses(prev => prev.filter(a => (a._id || a.id) !== id)); }
        catch (e) { Alert.alert('Error', 'Failed to delete address.'); }
      }},
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <View style={{ width: wp(40) }} />
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {showForm && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>{editingId ? 'Edit Address' : 'New Address'}</Text>
            {[
              { label: 'Full Name', value: fullName, onChange: setFullName, placeholder: 'First name, Last name' },
              { label: 'Phone Number', value: phone, onChange: setPhone, placeholder: '+20 000 00 00 000' },
              { label: 'Label (e.g. Home, Work)', value: label, onChange: setLabel, placeholder: 'Home' },
              { label: 'Street', value: street, onChange: setStreet, placeholder: '123 Main St' },
              { label: 'City', value: city, onChange: setCity, placeholder: 'Cairo' },
              { label: 'Country', value: country, onChange: setCountry, placeholder: 'Egypt', last: true },
            ].map((field, i) => (
              <View key={i} style={[styles.fieldGroup, field.last && styles.lastField]}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} placeholderTextColor="#B09090" />
              </View>
            ))}
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelFormBtn} onPress={resetForm}>
                <Text style={styles.cancelFormBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveFormBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveFormBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {addresses.length === 0 && !showForm ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySubtitle}>Add your first delivery address</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.emptyBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            {addresses.map((address, index) => (
              <View key={address._id} style={[styles.addressItem, index < addresses.length - 1 && styles.addressBorder]}>
                <View style={styles.addressLeft}>
                  <View style={styles.addressTopRow}>
                    <Text style={styles.addressLabel}>{address.label || 'Address'}</Text>
                    {address.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>}
                  </View>
                  <Text style={styles.addressText}>{address.street || address.address}</Text>
                  <Text style={styles.addressText}>{address.city}{address.country ? `, ${address.country}` : ''}</Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity onPress={() => openEdit(address)}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
                  {!address.isDefault && <TouchableOpacity onPress={() => handleSetDefault(address._id)}><Text style={styles.defaultBtn}>Set Default</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => handleDelete(address._id)}><Text style={styles.deleteBtn}>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  addBtn: { fontSize: fp(15), color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), padding: wp(16) },
  cardSectionLabel: { fontSize: fp(11), fontWeight: '700', color: '#7A6060', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: hp(14) },
  fieldGroup: { marginBottom: hp(14), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)', paddingBottom: hp(14) },
  lastField: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
  fieldLabel: { fontSize: fp(11), color: '#7A6060', marginBottom: hp(6), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: fp(15), color: '#2C1F1F' },
  formActions: { flexDirection: 'row', gap: wp(10), marginTop: hp(16) },
  cancelFormBtn: { flex: 1, padding: hp(12), borderRadius: wp(12), borderWidth: 1.5, borderColor: '#C17C74', alignItems: 'center' },
  cancelFormBtnText: { color: '#C17C74', fontWeight: '600', fontSize: fp(14) },
  saveFormBtn: { flex: 1, padding: hp(12), borderRadius: wp(12), backgroundColor: '#C17C74', alignItems: 'center' },
  saveFormBtnText: { color: '#fff', fontWeight: '600', fontSize: fp(14) },
  addressItem: { paddingVertical: hp(14) },
  addressBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  addressLeft: { flex: 1, marginBottom: hp(10) },
  addressTopRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: hp(4) },
  addressLabel: { fontSize: fp(14), fontWeight: '700', color: '#2C1F1F' },
  defaultBadge: { backgroundColor: '#C17C74', paddingHorizontal: wp(8), paddingVertical: hp(2), borderRadius: wp(10) },
  defaultBadgeText: { fontSize: fp(10), color: '#fff', fontWeight: '700' },
  addressText: { fontSize: fp(13), color: '#7A6060', marginTop: hp(2) },
  addressActions: { flexDirection: 'row', gap: wp(16) },
  editBtn: { fontSize: fp(13), color: '#C17C74', fontWeight: '600' },
  defaultBtn: { fontSize: fp(13), color: '#5A8B6A', fontWeight: '600' },
  deleteBtn: { fontSize: fp(13), color: '#C0444A', fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: hp(60) },
  emptyIcon: { fontSize: fp(48), marginBottom: hp(16) },
  emptyTitle: { fontSize: fp(18), fontWeight: '700', color: '#2C1F1F', marginBottom: hp(8) },
  emptySubtitle: { fontSize: fp(13), color: '#7A6060', marginBottom: hp(24) },
  emptyBtn: { backgroundColor: '#C17C74', paddingHorizontal: wp(28), paddingVertical: hp(12), borderRadius: wp(20) },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: fp(14) },
});