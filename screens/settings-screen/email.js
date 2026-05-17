import React, { useState, useContext } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestEmailChange } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons} from '@expo/vector-icons';


const EmailScreen = ({ navigation, route }) => {
  const user = route.params?.user || {};
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);

  const { logOut, getToken } = useContext(AuthContext);
      

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);


  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Email cannot be empty.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Validation', 'Enter a valid email address.');
      return;
    }

    if (email === user.email) {
      Alert.alert('Info', 'This is already your current email.');
      return;
    }

    console.log("About to send OTP");
    console.log("Navigating to VerifyEmail");

    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        console.warn("No token found");
        return;
      }
      
      console.log(token);
      const res = await requestEmailChange(token, email);

      Alert.alert('OTP Sent', res.message || 'Check your email for OTP');

      navigation.navigate('VerifyEmailScreen', { email });

    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
      <TouchableOpacity
  style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' }}
  onPress={() => navigation.goBack()}
  activeOpacity={0.8}
>
  <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
</TouchableOpacity>

        <Text style={styles.headerTitle}>Email Address</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || email === user.email}
        >
          <Text style={styles.saveBtn}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changing your email will require verification.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Email Address</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#B09090"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  backBtn: {
    fontSize: 28,
    color: '#C17C74',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#C17C74',
  },

  saveBtn: {
    fontSize: 15,
    color: '#C17C74',
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
    gap: 12,
  },

  infoBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#C17C74',
  },

  infoText: {
    fontSize: 13,
    color: '#C17C74',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    padding: 16,
  },

  fieldLabel: {
    fontSize: 11,
    color: '#7A6060',
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    fontSize: 15,
    color: '#2C1F1F',
  },
});