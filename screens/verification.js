// ─── VerificationScreen.js ───────────────────────────────────────────────────
import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { verifyOtp, verifyResetOtp } from '../services/authService';
import { wp, hp, fp } from '../utils/responsive';

export default function VerificationScreen({ navigation, route }) {
  const { logIn } = useContext(AuthContext);
  const { email = '', mode } = route.params || {};
  const isReset = mode === 'reset';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    if (!otp || otp.length < 6) { setError('Please enter the 6-digit code'); return; }
    if (isReset && !newPassword) { setError('Please enter your new password'); return; }
    setLoading(true);
    try {
      if (isReset) { await verifyResetOtp({ email, otp, newPassword }); navigation.navigate('Login'); }
      else { await verifyOtp({ email, otp }); navigation.navigate('Login'); }
    } catch (err) { setError(err.message || 'Verification failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <StatusBar style="dark" />
        <Image source={require('../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <FontAwesome name="envelope-o" size={wp(36)} color="#C17C74" />
          </View>
          <Text style={styles.title}>{isReset ? 'Reset Password' : 'Verify Your Email'}</Text>
          <Text style={styles.body}>We sent a 6-digit code to:</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.label}>Enter Code</Text>
          <TextInput style={styles.input} placeholder="******" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
          {isReset && (
            <>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.passwordInput} placeholder="Min 6 chars" value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={wp(20)} color="gray" />
                </TouchableOpacity>
              </View>
            </>
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isReset ? "Reset Password" : "Verify"}</Text>}
          </TouchableOpacity>
          <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendLink} onPress={() => navigation.goBack()}>Try again</Text></Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: '#F5F5F5', alignItems: "center", paddingHorizontal: wp(25), paddingTop: hp(60), paddingBottom: hp(40) },
  logo: { width: wp(150), height: hp(100), alignSelf: 'center', marginBottom: hp(30), marginTop: hp(40) },
  iconCircle: { width: wp(88), height: wp(88), borderRadius: wp(44), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center', alignSelf: "center", marginBottom: hp(24) },
  title: { fontSize: fp(26), fontWeight: 'bold', textAlign: 'center', marginBottom: hp(16), color: '#333' },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(20), width: "100%" },
  label: { fontSize: fp(14), marginBottom: hp(5), color: '#333' },
  input: { backgroundColor: 'white', borderRadius: wp(8), padding: wp(10), marginBottom: hp(15), fontSize: fp(18), textAlign: 'center', letterSpacing: 6 },
  body: { fontSize: fp(15), color: 'gray', textAlign: 'center', marginBottom: hp(6) },
  email: { fontSize: fp(15), fontWeight: '700', color: '#C17C74', marginBottom: hp(16), textAlign: 'center' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: wp(8), paddingHorizontal: wp(10), marginBottom: hp(15) },
  passwordInput: { flex: 1, paddingVertical: hp(10), fontSize: fp(14) },
  errorText: { color: '#c0392b', fontSize: fp(13), marginBottom: hp(10), textAlign: 'center' },
  button: { backgroundColor: '#C17C74', paddingVertical: hp(14), paddingHorizontal: wp(40), borderRadius: wp(10), alignItems: 'center', alignSelf: "center", marginBottom: hp(28), width: "75%" },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fp(16) },
  resendText: { fontSize: fp(13), textAlign: 'center', lineHeight: hp(20), color: '#333' },
  resendLink: { color: '#C17C74', fontWeight: '600' },
});