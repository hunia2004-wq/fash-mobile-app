import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { forgotPassword } from '../services/authService';
import { wp, hp, fp } from '../utils/responsive';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendReset = async () => {
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      await forgotPassword({ email });
      navigation.navigate("Verification", { email, mode: "reset" });
    } catch (err) { setError(err.message || 'Failed to send reset email. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <StatusBar style="dark" />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={wp(18)} color="#C17C74" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Image source={require('../source/assets/images/Blacklogo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleSendReset} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.loginText}>Remembered your password? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Log In</Text></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: '#F5F5F5', paddingHorizontal: wp(25), paddingTop: hp(60), paddingBottom: hp(40) },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(10), gap: wp(6) },
  backText: { color: '#C17C74', fontSize: fp(16) },
  logo: { width: wp(150), height: hp(100), alignSelf: 'center', marginBottom: hp(20) },
  title: { fontSize: fp(26), fontWeight: 'bold', textAlign: 'center', marginBottom: hp(6), color: '#333' },
  subtitle: { fontSize: fp(14), textAlign: 'center', color: 'gray', marginBottom: hp(25), paddingHorizontal: wp(10) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(20) },
  label: { fontSize: fp(14), marginBottom: hp(5), color: '#333' },
  input: { backgroundColor: 'white', borderRadius: wp(8), padding: wp(10), marginBottom: hp(15), fontSize: fp(14) },
  errorText: { color: '#c0392b', fontSize: fp(13), marginBottom: hp(10), textAlign: 'center' },
  button: { backgroundColor: '#C17C74', padding: hp(12), borderRadius: wp(8), alignItems: 'center', marginTop: hp(5) },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fp(16) },
  loginText: { textAlign: 'center', marginTop: hp(25), color: '#333', fontSize: fp(14) },
  loginLink: { color: '#C17C74', fontWeight: '600' },
});