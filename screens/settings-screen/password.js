import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import { Ionicons} from '@expo/vector-icons';


const ChangePasswordScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    console.log("CLICKED SAVE");
console.log("Old:", oldPassword);
console.log("New:", newPassword);

    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    
    try {
      const token = await getToken();
      console.log("TOKEN:", token);
      const res = await changePassword(token, { oldPassword, newPassword });
      console.log("API RESPONSE:", res);
      Alert.alert('Success', 'Your password has been changed.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log("FULL ERROR:", e);
      console.log("MESSAGE:", e.message);
    
      Alert.alert('Error', e.message || 'Failed to change password.');
    } finally{
      setSaving(false);
    }
  };

  const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor="#B09090"
        />
        <TouchableOpacity onPress={onToggle}>
          <Text style={styles.showBtn}>{show ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Change Password</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#C17C74" />
            : <Text style={styles.saveBtn}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your new password must be at least 6 characters long.
          </Text>
        </View>

        <View style={styles.card}>
          <PasswordField label="Current Password" value={oldPassword} onChange={setOldPassword} show={showOld} onToggle={() => setShowOld(!showOld)} />
          <View style={styles.divider} />
          <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} />
          <View style={styles.divider} />
          <View style={[styles.fieldGroup, styles.lastField]}>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput style={styles.passwordInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} placeholder="••••••••" placeholderTextColor="#B09090" />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.showBtn}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { fontSize: 28, color: '#C17C74', lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#C17C74' },
  saveBtn: { fontSize: 15, color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: 13, color: '#C17C74', fontWeight: 'bold', lineHeight: 20 },
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, padding: 16 },
  fieldGroup: { marginBottom: 14, paddingBottom: 14 },
  lastField: { marginBottom: 0, paddingBottom: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(140,100,100,0.2)', marginBottom: 14 },
  fieldLabel: { fontSize: 11, color: '#7A6060', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  passwordInput: { flex: 1, fontSize: 15, color: '#2C1F1F' },
  showBtn: { fontSize: 13, color: '#C17C74', fontWeight: '600' },
});

export default ChangePasswordScreen;