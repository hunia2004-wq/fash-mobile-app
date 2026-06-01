import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestEmailChange } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';
import { useTranslation } from 'react-i18next';

const EmailScreen = ({ navigation, route }) => {
  const user = route.params?.user || {};
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const { logOut, getToken } = useContext(AuthContext);
  const { t } = useTranslation();
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSave = async () => {
    if (!email.trim()) { Alert.alert(t('validation'), t('email_empty')); return; }
    if (!isValidEmail(email)) { Alert.alert(t('validation'), t('email_invalid')); return; }
    if (email === user.email) { Alert.alert(t('info'), t('email_same')); return; }
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await requestEmailChange(token, email);
      Alert.alert(t('otp_sent'), res.message || t('check_email_otp'));
      navigation.navigate('VerifyEmailScreen', { email });
    } catch (err) { Alert.alert(t('error'), err.message || t('something_went_wrong')); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings_email')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading || email === user.email}>
          <Text style={styles.saveBtn}>{loading ? t('saving') : t('save')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{t('email_change_info')}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>{t('settings_email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#B09090"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: fp(17), fontWeight: '700', color: '#C17C74' },
  saveBtn: { fontSize: fp(15), color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  infoBox: { borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', fontWeight: 'bold' },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), padding: wp(16) },
  fieldLabel: { fontSize: fp(11), color: '#7A6060', marginBottom: hp(6), fontWeight: '600' },
  input: { fontSize: fp(15), color: '#2C1F1F' },
});