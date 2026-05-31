import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, uploadAvatar, getProfile } from '../services/authService';
import { useFocusEffect } from "@react-navigation/native";
import { wp, hp, fp, SCREEN } from '../utils/responsive';

const avatarSize = wp(100);

export default function EditProfileScreen({ navigation, route }) {
  const { getToken } = useContext(AuthContext);
  const { user } = route.params;

  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    const fetchData = async () => {
      const token = await getToken();
      const profile = await getProfile(token);
      const data = profile?.data || profile;
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setUsername(data.username || '');
      setBio(data.bio || '');
      setPhone(data.phoneNumber || '');
      setAvatar(data.avatar || null);
    };
    fetchData();
  }, []));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission required', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      try { const token = await getToken(); await uploadAvatar(token, uri); }
      catch (e) { Alert.alert('Error', 'Failed to upload photo. Please try again.'); }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      const payload = { firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim(), bio: bio.trim(), phoneNumber: phone.trim() };
      await updateProfile(token, payload);
      Alert.alert("Saved", "Profile updated successfully", [{ text: "OK", onPress: () => { if (route.params?.refresh) route.params.refresh(); navigation.goBack(); } }]);
    } catch (e) { Alert.alert("Error", e.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtn}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#C17C74" /> : <Text style={styles.saveBtn}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image source={avatar ? { uri: avatar } : require('../source/assets/images/avatar.jpg')} style={styles.avatar} />
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>+</Text>
          </View>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Edit Profile</Text>
          {[
            { label: 'First Name', value: firstName, onChange: setFirstName, placeholder: 'First name' },
            { label: 'Last Name', value: lastName, onChange: setLastName, placeholder: 'Last name' },
            { label: 'Username', value: username, onChange: setUsername, placeholder: '@username' },
            { label: 'Phone Number', value: phone, onChange: setPhone, placeholder: '+20 000 00 00 000', keyboard: 'phone-pad' },
            { label: 'Bio', value: bio, onChange: setBio, placeholder: 'Bio' },
          ].map((field, i) => (
            <View key={i} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <TextInput style={styles.input} value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} placeholderTextColor="#B09090" keyboardType={field.keyboard} />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account Information</Text>
          {[
            { label: 'Email', value: user.email },
            { label: 'Date Joined', value: joinedDate },
            { label: 'Account Type', value: user.role || 'Standard', last: true },
          ].map((row, i) => (
            <View key={i} style={[styles.readOnlyRow, row.last && styles.lastField]}>
              <Text style={styles.readOnlyLabel}>{row.label}</Text>
              <Text style={styles.readOnlyValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingTop: hp(56), paddingBottom: hp(12) },
  headerTitle: { fontSize: fp(17), fontWeight: '700', color: '#2C1F1F' },
  cancelBtn: { fontSize: fp(15), color: '#C17C74' },
  saveBtn: { fontSize: fp(15), color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: wp(16), gap: hp(16) },
  avatarContainer: { alignItems: 'center', paddingVertical: hp(8) },
  avatar: { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
  avatarBadge: { position: 'absolute', bottom: hp(28), right: SCREEN.width / 2 - avatarSize / 2 - wp(4), backgroundColor: '#C17C74', width: avatarSize * 0.28, height: avatarSize * 0.28, borderRadius: (avatarSize * 0.28) / 2, justifyContent: 'center', alignItems: 'center' },
  avatarBadgeText: { color: 'white', fontWeight: 'bold', fontSize: avatarSize * 0.18 },
  changePhotoText: { marginTop: hp(8), fontSize: fp(13), color: '#B07070', fontWeight: '600' },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), padding: wp(16) },
  sectionLabel: { fontSize: fp(11), fontWeight: '700', color: 'black', letterSpacing: 1, textTransform: 'uppercase', marginBottom: hp(14) },
  fieldGroup: { marginBottom: hp(14), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)', paddingBottom: hp(14) },
  fieldLabel: { fontSize: fp(11), color: 'black', marginBottom: hp(6), fontWeight: '500' },
  input: { fontSize: fp(15), color: '#2C1F1F', paddingVertical: 0 },
  readOnlyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hp(12), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  lastField: { borderBottomWidth: 0 },
  readOnlyLabel: { fontSize: fp(14), color: '#7A6060' },
  readOnlyValue: { fontSize: fp(14), color: '#2C1F1F', fontWeight: '500' },
});