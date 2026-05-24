import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { login, loginWithSocialToken } from '../services/authService';
import { useSignInWithGoogle, useSignInWithApple } from '@clerk/expo';

export default function LoginScreen({ navigation }) {
  const { logIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn: googleSignIn } = useSignInWithGoogle();
  const { signIn: appleSignIn } = useSignInWithApple();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      // Extract user ID from whichever field the backend returns it on
      const userId = data.user?._id ?? data.user?.id ?? data.userId ?? data._id ?? null;
      await logIn(data.access_token, userId);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result?.createdSessionId) {
        // Get Clerk token and exchange for your backend JWT
        const token = await result.getToken();
        const data = await loginWithSocialToken(token, 'google');
        const userId = data.user?._id ?? data.user?.id ?? null;
        await logIn(data.access_token, userId);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const result = await appleSignIn();
      if (result?.createdSessionId) {
        const token = await result.getToken();
        const data = await loginWithSocialToken(token, 'apple');
        const userId = data.user?._id ?? data.user?.id ?? null;
        await logIn(data.access_token, userId);
      }
    } catch (err) {
      setError(err.message || 'Apple sign-in failed');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <StatusBar style="dark" />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={18} color="#C17C74" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Image
          source={require('../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcome}>Welcome to FASH!</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter your password"
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={20} color="gray" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.buttonText}>Log In</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <Text style={styles.register}>
          Not a member?{' '}
          <Text style={styles.registerNow} onPress={() => navigation.navigate('Signup')}>
            Sign Up
          </Text>
        </Text>

        <Text style={styles.or}>Or continue with</Text>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#DB4437' }]} onPress={handleGoogleSignIn}>
            <FontAwesome name="google" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.social, { backgroundColor: '#000' }]} onPress={handleAppleSignIn}>
            <FontAwesome name="apple" size={20} color="white" />
          </TouchableOpacity>
          {/* Facebook stays as browser-based OAuth via Clerk — add later */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 150,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: 'gray',
  },
  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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
    paddingVertical: 10,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C17C74',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
  forgot: {
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  register: {
    marginTop: 10,
  },
  registerNow: {
    color: '#C17C74',
    fontWeight: '600',
  },
  or: {
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 15,
    color: 'gray',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  social: {
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});