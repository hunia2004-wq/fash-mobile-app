import React, { useState, useContext } from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { login } from '../services/authService';
import * as SecureStore from 'expo-secure-store';

const C = {
  bg: '#F5F5F5',
  white: '#FFFFFF',
  accent: '#C17C74',
  accentLight: '#F6E9E6',
  text: '#1C1C1E',
  muted: '#8E8E93',
  border: '#E5E5EA',
  danger: '#FF3B30',
  card: '#F2E6E3',
};

export default function CourierLoginScreen({ navigation }) {
  const { logIn } = useContext(AuthContext);

  const [courierId, setCourierId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  function validate() {
    const e = {};

    if (!courierId.trim()) {
      e.courierId = 'Courier ID is required';
    }

    if (!email.trim()) {
      e.email = 'Email is required';
    } else if (!email.includes('@')) {
      e.email = 'Enter a valid email';
    }

    if (!password) {
      e.password = 'Password is required';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  }

  // ─────────────────────────────────────────────
  // Login Handler
  // ─────────────────────────────────────────────
  async function handleLogin() {
    setError('');
    if (!validate()) return;
    setLoading(true);
  
    try {
      const data = await login({
        email: email.trim(),
        password,
      });
  
      const role = data.user?.role ?? data.role;
  
      // Role check — must be courier or admin
      if (role !== 'courier' && role !== 'admin') {
        setError('This account does not have courier access.');
        setLoading(false);
        return;
      }
  
      // ✅ Store courier token SEPARATELY — never call logIn()
      // Calling logIn() would set userToken and flip navigator to Home
      await SecureStore.setItemAsync('courierToken', data.access_token);
      await SecureStore.setItemAsync('courierId', courierId.trim());
      await SecureStore.setItemAsync('courierRole', role);
  
      navigation.replace('CourierStatusScreen');
  
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.bg}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={C.accent}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={require('../source/assets/images/Blacklogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <View style={styles.titleWrap}>
          <View style={styles.courierBadge}>
            <Ionicons
              name="car-outline"
              size={16}
              color={C.accent}
            />

            <Text style={styles.courierBadgeText}>
              Courier Portal
            </Text>
          </View>

          <Text style={styles.title}>
            Welcome back
          </Text>

          <Text style={styles.sub}>
            Log in to start your pickup session
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>

          {/* Courier ID */}
          <Text style={styles.label}>
            Courier ID{' '}
            <Text style={{ color: C.accent }}>
              *
            </Text>
          </Text>

          <View
            style={[
              styles.inputWrap,
              errors.courierId &&
                styles.inputError,
            ]}
          >
            <Ionicons
              name="id-card-outline"
              size={18}
              color={C.muted}
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Your assigned courier ID"
              placeholderTextColor={C.muted}
              value={courierId}
              autoCapitalize="characters"
              onChangeText={(v) => {
                setCourierId(v);

                setErrors((p) => ({
                  ...p,
                  courierId: null,
                }));
              }}
            />
          </View>

          {errors.courierId ? (
            <Text style={styles.fieldError}>
              {errors.courierId}
            </Text>
          ) : null}

          {/* Email */}
          <Text
            style={[
              styles.label,
              { marginTop: 14 },
            ]}
          >
            Email{' '}
            <Text style={{ color: C.accent }}>
              *
            </Text>
          </Text>

          <View
            style={[
              styles.inputWrap,
              errors.email && styles.inputError,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={C.muted}
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="courier@fash.com"
              placeholderTextColor={C.muted}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(v) => {
                setEmail(v);

                setErrors((p) => ({
                  ...p,
                  email: null,
                }));
              }}
            />
          </View>

          {errors.email ? (
            <Text style={styles.fieldError}>
              {errors.email}
            </Text>
          ) : null}

          {/* Password */}
          <Text
            style={[
              styles.label,
              { marginTop: 14 },
            ]}
          >
            Password{' '}
            <Text style={{ color: C.accent }}>
              *
            </Text>
          </Text>

          <View
            style={[
              styles.inputWrap,
              errors.password &&
                styles.inputError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={C.muted}
              style={styles.inputIcon}
            />

            <TextInput
              style={[
                styles.input,
                { flex: 1 },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={C.muted}
              value={password}
              secureTextEntry={!showPw}
              onChangeText={(v) => {
                setPassword(v);

                setErrors((p) => ({
                  ...p,
                  password: null,
                }));
              }}
            />

            <TouchableOpacity
              onPress={() => setShowPw(!showPw)}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={
                  showPw
                    ? 'eye-outline'
                    : 'eye-off-outline'
                }
                size={18}
                color={C.muted}
              />
            </TouchableOpacity>
          </View>

          {errors.password ? (
            <Text style={styles.fieldError}>
              {errors.password}
            </Text>
          ) : null}

          {/* Global Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color={C.danger}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color={C.white}
                size="small"
              />
            ) : (
              <>
                <Text style={styles.loginBtnText}>
                  Log In
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={C.white}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={C.accent}
          />

          <Text style={styles.infoText}>
            Your Courier ID is provided by
            FASH operations. Contact your
            supervisor if you don't have one.
          </Text>
        </View>

        {/* Customer Login */}
        <Text style={styles.notCourier}>
          Not a courier?{' '}

          <Text
            style={styles.notCourierLink}
            onPress={() =>
              navigation.navigate('Welcome')
            }
          >
            Customer login
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },

  backText: {
    color: C.accent,
    fontSize: 15,
    fontWeight: '500',
  },

  logo: {
    width: 130,
    height: 52,
    alignSelf: 'center',
    marginBottom: 24,
  },

  titleWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },

  courierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F6E9E6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },

  courierBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.accent,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },

  sub: {
    fontSize: 14,
    color: C.muted,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 7,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    color: C.text,
  },

  inputError: {
    borderColor: C.danger,
  },

  fieldError: {
    fontSize: 12,
    color: C.danger,
    marginTop: 4,
    marginLeft: 2,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0EF',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: C.danger,
  },

  loginBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },

  loginBtnText: {
    color: C.white,
    fontWeight: '700',
    fontSize: 16,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F6E9E6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#7A5A56',
    lineHeight: 18,
  },

  notCourier: {
    textAlign: 'center',
    fontSize: 13,
    color: C.muted,
  },

  notCourierLink: {
    color: C.accent,
    fontWeight: '600',
  },
});