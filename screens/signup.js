import { useState, useContext } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { signup } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import { wp, hp, fp } from '../utils/responsive';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logIn } = useContext(AuthContext);

  const handleSignUp = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signup({ firstName, lastName, email, password, fullname: `${firstName} ${lastName}` });
      navigation.navigate('Verification', { email });
    } catch (err) { setError(err.message || "Sign up failed. Please try again"); }
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started with FASH!</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name</Text>
              <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </View>
          </View>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Enter your password" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={wp(20)} color="gray" />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Confirm your password" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <FontAwesome name={showConfirmPassword ? 'eye' : 'eye-slash'} size={wp(20)} color="gray" />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.or}>Or continue with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#DB4437' }]}>
            <FontAwesome name="google" size={wp(20)} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#000' }]}>
            <FontAwesome name="apple" size={wp(20)} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.loginText}>Already a member? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Log In</Text></Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: '#F5F5F5', paddingHorizontal: wp(25), paddingTop: hp(60), paddingBottom: hp(40) },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: hp(10), gap: wp(6) },
  backText: { color: '#C17C74', fontSize: fp(16) },
  logo: { width: wp(150), height: hp(100), alignSelf: 'center', marginBottom: hp(20) },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: wp(10) },
  halfInput: { flex: 1 },
  title: { fontSize: fp(26), fontWeight: 'bold', textAlign: 'center', marginBottom: hp(6), color: '#333' },
  subtitle: { fontSize: fp(14), textAlign: 'center', color: 'gray', marginBottom: hp(25) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(20) },
  label: { fontSize: fp(14), marginBottom: hp(5), color: 'black' },
  input: { backgroundColor: 'white', borderRadius: wp(8), padding: wp(10), marginBottom: hp(15), fontSize: fp(14) },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: wp(8), paddingHorizontal: wp(10), marginBottom: hp(15) },
  passwordInput: { flex: 1, paddingVertical: hp(10), fontSize: fp(14) },
  errorText: { color: '#c0392b', fontSize: fp(13), marginBottom: hp(10), textAlign: 'center' },
  button: { backgroundColor: '#C17C74', padding: hp(12), borderRadius: wp(8), alignItems: 'center', marginTop: hp(5) },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fp(16) },
  or: { textAlign: 'center', marginTop: hp(25), marginBottom: hp(15), color: 'gray', fontSize: fp(14) },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: wp(15) },
  social: { width: wp(45), height: wp(45), borderRadius: wp(25), alignItems: 'center', justifyContent: 'center' },
  loginText: { textAlign: 'center', marginTop: hp(20), color: '#333', fontSize: fp(14) },
  loginLink: { color: '#C17C74', fontWeight: '600' },
});