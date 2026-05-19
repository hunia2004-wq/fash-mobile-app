import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getAddresses, addAddress, updateAddress, setDefaultAddress, deleteAddress, } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';


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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      const res = await getAddresses(token);

      console.log("RAW RESPONSE:", res);

      const data =
        res?.data?.data ||
        res?.data ||
        res ||
        [];

      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("ADDRESS ERROR:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setLabel('');
    setStreet('');
    setCity('');
    setCountry('');
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (address) => {
    setFullName(address.fullName || '');
    setPhone(address.phone || '');
    setLabel(address.label || '');
    setStreet(address.street || address.address || '');
    setCity(address.city || '');
    setCountry(address.country || '');
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !label.trim() ||
      !street.trim() ||
      !city.trim() ||
      !country.trim()
    ) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    setSaving(true);

    try {
      const token = await getToken();

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        label: label.trim(),
        street: street.trim(),
        city: city.trim(),
        country: country.trim(),
      };

      console.log("SAVING ADDRESS:", payload);

      if (editingId) {
        await updateAddress(token, editingId, payload);
      } else {
        await addAddress(token, payload);
      }

      const savedAddress = {
        _id: Date.now().toString(),
        ...payload,
      };

      if (!editingId) {
        setAddresses((prev) => [savedAddress, ...prev]);
      }

      await fetchAddresses();
      resetForm();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = await getToken();
      await setDefaultAddress(token, id);
      await fetchAddresses();
    } catch (e) {
      Alert.alert('Error', 'Failed to set default address.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken();
            await deleteAddress(token, id);
            setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Addresses</Text>
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
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Add / Edit Form */}
        {showForm && (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>
              {editingId ? 'Edit Address' : 'New Address'}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="First name, Last name" placeholderTextColor="#B09090" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+20 000 00 00 000" placeholderTextColor="#B09090" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Label (e.g. Home, Work)</Text>
              <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Home" placeholderTextColor="#B09090" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Street</Text>
              <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="123 Main St" placeholderTextColor="#B09090" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Cairo" placeholderTextColor="#B09090" />
            </View>

            <View style={[styles.fieldGroup, styles.lastField]}>
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Egypt" placeholderTextColor="#B09090" />
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

        {/* Address List */}
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
              <View
                key={address._id}
                style={[styles.addressItem, index < addresses.length - 1 && styles.addressBorder]}
              >
                <View style={styles.addressLeft}>
                  <View style={styles.addressTopRow}>
                    <Text style={styles.addressLabel}>{address.label || 'Address'}</Text>
                    {(address.isDefault) && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>
                    {address.street || address.address}
                  </Text>
                  <Text style={styles.addressText}>
                    {address.city}{address.country ? `, ${address.country}` : ''}
                  </Text>
                </View>

                <View style={styles.addressActions}>
                  <TouchableOpacity onPress={() => openEdit(address)}>
                    <Text style={styles.editBtn}>Edit</Text>
                  </TouchableOpacity>
                  {!(address.isDefault) && (
                    <TouchableOpacity onPress={() => handleSetDefault(address._id || address._id)}>
                      <Text style={styles.defaultBtn}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(address._id || address._id)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </TouchableOpacity>
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
  addressItem: { paddingVertical: 14 },
  addressBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  addressLeft: { flex: 1, marginBottom: 10 },
  addressTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: '#2C1F1F' },
  defaultBadge: { backgroundColor: '#C17C74', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  defaultBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  addressText: { fontSize: 13, color: '#7A6060', marginTop: 2 },
  addressActions: { flexDirection: 'row', gap: 16 },
  editBtn: { fontSize: 13, color: '#C17C74', fontWeight: '600' },
  defaultBtn: { fontSize: 13, color: '#5A8B6A', fontWeight: '600' },
  deleteBtn: { fontSize: 13, color: '#C0444A', fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2C1F1F', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#7A6060', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#C17C74', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 20 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});