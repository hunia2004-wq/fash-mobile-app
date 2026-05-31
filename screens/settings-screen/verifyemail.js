import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { verifyEmailChange } from '../../services/authService';
import { wp, hp, fp } from '../../utils/responsive';

const VerifyEmailScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useContext(AuthContext);
  const email = route?.params?.email;

  const handleVerify = async () => {
    if (!otp) { Alert.alert('Error', 'Enter OTP'); return; }
    try {
      setLoading(true);
      const token = await getToken();
      const res = await verifyEmailChange(token, otp);
      Alert.alert('Success', res.message, [{ text: 'OK', onPress: () => navigation.getParent()?.navigate('Profile') }]);
    } catch (err) { Alert.alert('Error', err.message || 'Network error'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={{ fontSize: wp(28) }}>📧</Text>
      </View>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.body}>Enter the OTP sent to your email</Text>
      {email && <Text style={styles.email}>{email}</Text>}
      <View style={styles.card}>
        <Text style={styles.label}>OTP Code</Text>
        <TextInput value={otp} onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="------" keyboardType="number-pad" style={styles.input} />
        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', alignItems: 'center', paddingHorizontal: wp(25), paddingTop: hp(60) },
  iconCircle: { width: wp(88), height: wp(88), borderRadius: wp(44), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center', marginBottom: hp(20), marginTop: hp(50) },
  title: { fontSize: fp(26), fontWeight: 'bold', marginBottom: hp(10) },
  body: { fontSize: fp(15), color: 'gray', textAlign: 'center' },
  email: { fontSize: fp(15), fontWeight: '700', color: '#C17C74', marginVertical: hp(15) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(20), width: '100%' },
  label: { fontSize: fp(14), marginBottom: hp(5) },
  input: { backgroundColor: 'white', borderRadius: wp(8), padding: wp(12), marginBottom: hp(15), textAlign: 'center', letterSpacing: 6, fontSize: fp(16) },
  button: { backgroundColor: '#C17C74', paddingVertical: hp(14), borderRadius: wp(10), alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fp(15) },
});