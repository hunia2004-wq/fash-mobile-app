import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { toggle2FA, get2FA } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

const TwoFactorAuthScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [twoFA, setTwoFA] = useState({ authenticatorApp: false, smsVerification: false, emailVerification: false });
  const [loading, setLoading] = useState(false);

  const handleToggle = async (key, value) => {
    const token = await getToken();
    const prevState = { ...twoFA };
    setLoading(true);
    setTwoFA(prev => ({ ...prev, [key]: value }));
    try {
      const res = await toggle2FA(token, { method: key, enabled: value });
      setTwoFA(res?.twoFactor || res);
    } catch (e) {
      setTwoFA(prevState);
      Alert.alert('Error', 'Failed to update 2FA settings.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const token = await getToken();
        const res = await get2FA(token);
        const data = res?.twoFactor || res;
        setTwoFA({ authenticatorApp: data?.authenticatorApp ?? false, smsVerification: data?.smsVerification ?? false, emailVerification: data?.emailVerification ?? false });
      } catch (e) { console.log("FAILED TO LOAD 2FA:", e.message); }
    };
    loadSecurity();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: wp(40) }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Two-factor authentication adds an extra layer of security to your account by requiring a code in addition to your password.</Text>
        </View>
        <View style={styles.card}>
          {[
            { key: 'authenticatorApp', title: 'Authenticator App', subtitle: 'Google Authenticator, Authy' },
            { key: 'smsVerification', title: 'SMS Verification', subtitle: 'Text message to +20 *** ***9856' },
            { key: 'emailVerification', title: 'Email Verification', subtitle: 'aynourhamadaa@gmail.com' },
          ].map((item, index) => (
            <View key={item.key} style={[styles.toggleRow, index > 0 && styles.rowBorder]}>
              <View style={styles.toggleLeft}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Switch
                disabled={loading}
                value={twoFA[item.key]}
                onValueChange={(v) => handleToggle(item.key, v)}
                trackColor={{ false: '#ccc', true: '#B07070' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', lineHeight: hp(20), fontWeight: 'bold' },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(16) },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(140,100,100,0.2)' },
  toggleLeft: { flex: 1, paddingRight: wp(12) },
  itemTitle: { fontSize: fp(15), fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: fp(12), color: '#7A6060', marginTop: hp(2) },
});

export default TwoFactorAuthScreen;