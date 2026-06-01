import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';
import { useTranslation } from 'react-i18next';

const ChangePasswordScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const { t } = useTranslation();
  const [oldPassword,     setOldPassword]     = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving,          setSaving]          = useState(false);
  const [showOld,         setShowOld]         = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { Alert.alert(t('validation'), t('fill_all_fields')); return; }
    if (newPassword !== confirmPassword) { Alert.alert(t('validation'), t('passwords_no_match')); return; }
    if (newPassword.length < 6) { Alert.alert(t('validation'), t('password_min_length')); return; }
    setSaving(true);
    try {
      const token = await getToken();
      await changePassword(token, { oldPassword, newPassword });
      Alert.alert(t('success'), t('password_changed'), [{ text: t('ok'), onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert(t('error'), e.message || t('password_change_failed')); }
    finally { setSaving(false); }
  };

  const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordRow}>
        <TextInput style={styles.passwordInput} value={value} onChangeText={onChange} secureTextEntry={!show} placeholder="••••••••" placeholderTextColor="#B09090" />
        <TouchableOpacity onPress={onToggle}>
          <Text style={styles.showBtn}>{show ? t('hide') : t('show')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings_password')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#C17C74" />
            : <Text style={styles.saveBtn}>{t('save')}</Text>
          }
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{t('password_info')}</Text>
        </View>
        <View style={styles.card}>
          <PasswordField label={t('current_password')} value={oldPassword}     onChange={setOldPassword}     show={showOld}     onToggle={() => setShowOld(!showOld)} />
          <View style={styles.divider} />
          <PasswordField label={t('new_password')}     value={newPassword}     onChange={setNewPassword}     show={showNew}     onToggle={() => setShowNew(!showNew)} />
          <View style={styles.divider} />
          <View style={[styles.fieldGroup, styles.lastField]}>
            <Text style={styles.fieldLabel}>{t('confirm_new_password')}</Text>
            <View style={styles.passwordRow}>
              <TextInput style={styles.passwordInput} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirm} placeholder="••••••••" placeholderTextColor="#B09090" />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Text style={styles.showBtn}>{showConfirm ? t('hide') : t('show')}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fp(17), fontWeight: '700', color: '#C17C74' },
  saveBtn: { fontSize: fp(15), color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', fontWeight: 'bold', lineHeight: hp(20) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), padding: wp(16) },
  fieldGroup: { marginBottom: hp(14), paddingBottom: hp(14) },
  lastField: { marginBottom: 0, paddingBottom: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(140,100,100,0.2)', marginBottom: hp(14) },
  fieldLabel: { fontSize: fp(11), color: '#7A6060', marginBottom: hp(6), fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  passwordInput: { flex: 1, fontSize: fp(15), color: '#2C1F1F' },
  showBtn: { fontSize: fp(13), color: '#C17C74', fontWeight: '600' },
});

export default ChangePasswordScreen;