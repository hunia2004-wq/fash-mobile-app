import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { verifyOtp, verifyResetOtp } from '../services/authService';


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
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    if (isReset && !newPassword) {
      setError('Please enter your new password');
      return;
    }
    setLoading(true);
    try {
      if (isReset) {
        // Verify reset OTP and set new password
        await verifyResetOtp({ email, otp, newPassword });
        navigation.navigate('Login');
      } else {
        // Verify signup OTP
        await verifyOtp({ email, otp });
        navigation.navigate('Login');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


return (
  <KeyboardAvoidingView style={{ flex:1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />

      <Image
        source={require('../source/assets/images/Blacklogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <FontAwesome name="envelope-o" size={36} color="#C17C74" />
      </View>

      <Text style={styles.title}>
        {isReset ? 'Reset Password' : 'Verify Your Email'}
      </Text>

      <Text style={styles.body}>
        We sent a 6-digit code to:
      </Text>

      <Text style={styles.email}>{email}</Text>

      <Text style={styles.label}>Enter Code</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />

        {isReset && (
          <>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min 6 chars"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />

      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}


      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify} disabled={loading}
      >

        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>
              {isReset ? "Reset Password" : "Verify"}
            </Text>  
        }

      </TouchableOpacity>

      <Text style={styles.resendText}>
        Didn't receive a code?{''}
        <Text style={styles.resendLink} onPress={() => navigation.goBack()}>
          Try again
        </Text>
        
      </Text>
    </View> 
    </ScrollView>
    </KeyboardAvoidingView> 
  );
}
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    alignItems: "center",
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  backText: {
    color: '#C17C74',
    fontSize: 16,
  },
  logo: {
    width: 150,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F2E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 12,
    padding: 20,
    width: "100%"
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 6,
  },
  body: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C17C74',
    marginBottom: 16,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'white', 
    borderRadius: 8,
    paddingHorizontal: 10, 
    marginBottom: 15,
  },
  passwordInput: { 
    flex: 1, 
    paddingVertical: 10 
  },
  errorText: { 
    color: '#c0392b', 
    fontSize: 13, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  button: {
    backgroundColor: '#C17C74',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 28,
    width: "75%",
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resendText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    color: '#333',
  },
  resendLink: {
    color: '#C17C74',
    fontWeight: '600',
  },
});