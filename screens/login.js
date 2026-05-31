// ─── LoginScreen.js ──────────────────────────────────────────────────────────
import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { login, loginWithSocialToken } from '../services/authService';
import { wp, hp, fp } from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const { logIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await login({ email, password });
      const userId = data.user?._id ?? data.user?.id ?? data.userId ?? data._id ?? null;
      await logIn(data.access_token, userId);
    } catch (err) { setError(err.message || "Login failed. Please try again."); }
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
        <Text style={styles.welcome}>Welcome to FASH!</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput placeholder="Enter your email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput placeholder="Enter your password" style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={wp(20)} color="gray" />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
        <Text style={styles.register}>Not a member? <Text style={styles.registerNow} onPress={() => navigation.navigate('Signup')}>Sign Up</Text></Text>
        <Text style={styles.or}>Or continue with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#DB4437' }]}>
            <FontAwesome name="google" size={wp(20)} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#000' }]}>
            <FontAwesome name="apple" size={wp(20)} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: '#F5F5F5', paddingHorizontal: wp(25), paddingTop: hp(60), paddingBottom: hp(40) },
  logo: { width: wp(150), height: hp(100), alignSelf: 'center', marginBottom: hp(30) },
  welcome: { fontSize: fp(20), fontWeight: '600', marginBottom: hp(20), color: 'gray' },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(20) },
  label: { fontSize: fp(14), marginBottom: hp(5) },
  input: { backgroundColor: 'white', borderRadius: wp(8), padding: wp(10), marginBottom: hp(15), fontSize: fp(14) },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: wp(8), paddingHorizontal: wp(10), marginBottom: hp(15) },
  passwordInput: { flex: 1, paddingVertical: hp(10), fontSize: fp(14) },
  errorText: { color: '#c0392b', fontSize: fp(13), marginBottom: hp(10), textAlign: 'center' },
  button: { backgroundColor: '#C17C74', padding: hp(12), borderRadius: wp(8), alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fp(15) },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(10), gap: wp(6) },
  backText: { color: '#C17C74', fontSize: fp(16) },
  forgot: { marginTop: hp(15), textDecorationLine: 'underline', fontSize: fp(14) },
  register: { marginTop: hp(10), fontSize: fp(14) },
  registerNow: { color: '#C17C74', fontWeight: '600' },
  or: { textAlign: 'center', marginTop: hp(25), marginBottom: hp(15), color: 'gray', fontSize: fp(14) },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: wp(15) },
  social: { width: wp(45), height: wp(45), borderRadius: wp(25), alignItems: 'center', justifyContent: 'center' },
});