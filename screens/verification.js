import { useContext, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../App';

export default function VerificationScreen({ navigation, route }) {
  const { email = '', mode } = route.params || {};
  const isReset = mode === 'reset';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      <Image
        source={require('../source/assets/images/Blacklogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <FontAwesome name="envelope-o" size={40} color="#C17C74" />
      </View>

      <Text style={styles.title}>
        {isReset ? 'Check Your Email' : 'Verify Your Email'}
      </Text>

      <Text style={styles.body}>
        {isReset
          ? 'We sent a password reset link to:'
          : 'We sent a verification link to:'}
      </Text>

      <Text style={styles.email}>{email}</Text>

      <Text style={styles.hint}>
        {isReset
          ? 'Click the link in the email to reset your password. It expires in 1 hour.'
          : 'Click the link in the email to activate your account, then come back to log in.'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Go to Log In</Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>
        Didn't receive an email?{'\n'}Check your spam folder or{' '}
        <Text style={styles.resendLink} onPress={() => navigation.goBack()}>
          try again
        </Text>
        .
      </Text>
    </View> 
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
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
  hint: {
    fontSize: 13,
    color: 'gray',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    paddingHorizontal: 10,
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