import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { courierLogin } from '../services/authService';
import { wp, hp, fp } from '../utils/responsive';
import { useTranslation } from 'react-i18next';
import i18n from '../source/i18n';

const C = {
  bg: '#F5F5F5', white: '#FFFFFF', accent: '#C17C74',
  accentLight: '#F6E9E6', text: '#1C1C1E', muted: '#8E8E93',
  border: '#E5E5EA', danger: '#FF3B30', card: '#F2E6E3',
};

export default function CourierLoginScreen({ navigation }) {
  const { t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [courierId, setCourierId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!courierId.trim()) e.courierId = t('courier.login.id_required');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await courierLogin({ courierId });
      await SecureStore.setItemAsync('courierToken', data.access_token);
      await SecureStore.setItemAsync('courierId', data.courier.courierId);
      await SecureStore.setItemAsync('courierName', data.courier.name);
      await SecureStore.setItemAsync('courierRole', 'courier');
      navigation.replace('CourierStatusScreen');
    } catch (err) {
      setError(err.message || t('courier.login.login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { direction: isRTL ? 'rtl' : 'ltr' }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={wp(20)} color={C.accent} />
          <Text style={styles.backText}>{t('courier.login.back')}</Text>
        </TouchableOpacity>

        <Image source={require('../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />

        <View style={styles.titleWrap}>
          <View style={styles.courierBadge}>
            <Ionicons name="car-outline" size={wp(16)} color={C.accent} />
            <Text style={styles.courierBadgeText}>{t('courier.login.badge')}</Text>
          </View>
          <Text style={styles.title}>{t('courier.login.title')}</Text>
          <Text style={styles.sub}>{t('courier.login.subtitle')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.label, isRTL && styles.rtlText]}>
            {t('courier.login.id_label')} <Text style={{ color: C.accent }}>*</Text>
          </Text>
          <View style={[styles.inputWrap, errors.courierId && styles.inputError]}>
            <Ionicons name="id-card-outline" size={wp(18)} color={C.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isRTL && styles.rtlText]}
              placeholder={t('courier.login.id_placeholder')}
              placeholderTextColor={C.muted}
              value={courierId}
              autoCapitalize="characters"
              textAlign={isRTL ? 'right' : 'left'}
              onChangeText={(v) => { setCourierId(v); setErrors(p => ({ ...p, courierId: null })); }}
            />
          </View>
          {errors.courierId ? <Text style={[styles.fieldError, isRTL && styles.rtlText]}>{errors.courierId}</Text> : null}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={wp(15)} color={C.danger} />
              <Text style={[styles.errorText, isRTL && styles.rtlText]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={C.white} size="small" /> : (
              <>
                <Text style={styles.loginBtnText}>{t('courier.login.login_btn')}</Text>
                <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={wp(18)} color={C.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={wp(16)} color={C.accent} />
          <Text style={[styles.infoText, isRTL && styles.rtlText]}>{t('courier.login.info')}</Text>
        </View>

        <Text style={[styles.notCourier, isRTL && styles.rtlText]}>
          {t('courier.login.not_courier')}{' '}
          <Text style={styles.notCourierLink} onPress={() => navigation.navigate('Welcome')}>
            {t('courier.login.customer_login')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: C.bg, paddingHorizontal: wp(24), paddingTop: hp(56), paddingBottom: hp(40) },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginBottom: hp(16) },
  backText: { color: C.accent, fontSize: fp(15), fontWeight: '500' },
  logo: { width: wp(130), height: hp(52), alignSelf: 'center', marginBottom: hp(24) },
  titleWrap: { alignItems: 'center', marginBottom: hp(28) },
  courierBadge: { flexDirection: 'row', alignItems: 'center', gap: wp(6), backgroundColor: '#F6E9E6', borderRadius: wp(20), paddingHorizontal: wp(12), paddingVertical: hp(5), marginBottom: hp(10) },
  courierBadgeText: { fontSize: fp(12), fontWeight: '600', color: C.accent },
  title: { fontSize: fp(24), fontWeight: '700', color: C.text, marginBottom: hp(4) },
  sub: { fontSize: fp(14), color: C.muted },
  card: { backgroundColor: C.card, borderRadius: wp(20), padding: wp(20), marginBottom: hp(16) },
  label: { fontSize: fp(13), fontWeight: '600', color: C.text, marginBottom: hp(7) },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: wp(12), borderWidth: 1.5, borderColor: C.border, paddingHorizontal: wp(12) },
  inputIcon: { marginRight: wp(8) },
  input: { flex: 1, paddingVertical: hp(13), fontSize: fp(14), color: C.text },
  inputError: { borderColor: C.danger },
  fieldError: { fontSize: fp(12), color: C.danger, marginTop: hp(4), marginLeft: wp(2) },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: wp(6), backgroundColor: '#FFF0EF', borderRadius: wp(10), padding: wp(12), marginTop: hp(14) },
  errorText: { flex: 1, fontSize: fp(13), color: C.danger },
  loginBtn: { backgroundColor: C.accent, borderRadius: wp(14), paddingVertical: hp(15), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8), marginTop: hp(20) },
  loginBtnText: { color: C.white, fontWeight: '700', fontSize: fp(16) },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: wp(8), backgroundColor: '#F6E9E6', borderRadius: wp(12), padding: wp(14), marginBottom: hp(20) },
  infoText: { flex: 1, fontSize: fp(12), color: '#7A5A56', lineHeight: hp(18) },
  notCourier: { textAlign: 'center', fontSize: fp(13), color: C.muted },
  notCourierLink: { color: C.accent, fontWeight: '600' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});