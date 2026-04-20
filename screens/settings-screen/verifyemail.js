import React, { useState, useContext } from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { verifyEmailChange } from '../../services/authService';

const VerifyEmailScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useContext(AuthContext);

  const email = route?.params?.email;

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Enter OTP');
      return;
    }
  
    try {
      setLoading(true);
  
      const token = await getToken();
  
      console.log("VERIFY TOKEN:", token);
  
      const res = await verifyEmailChange(token, otp);
  
      Alert.alert('Success', res.message, [
        {
          text: 'OK',
          onPress: () =>
            navigation.getParent()?.navigate('Profile')
        },
      ]);
      
    } catch (err) {

      console.log("VERIFY ERROR:", err);

      Alert.alert('Error', err.message || 'Network error');

    } finally {
      setLoading(false);
    }
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={{ fontSize: 28 }}>📧</Text>
      </View>

      <Text style={styles.title}>Verify Email</Text>

      <Text style={styles.body}>
        Enter the OTP sent to your email
      </Text>

      {email && <Text style={styles.email}>{email}</Text>}

      <View style={styles.card}>
        <Text style={styles.label}>OTP Code</Text>

        <TextInput
          value={otp}
          onChangeText={(text) =>
            setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))
          }
          placeholder="------"
          keyboardType="number-pad"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 60,
  },

  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F2E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  body: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
  },

  email: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C17C74',
    marginVertical: 15,
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
  },

  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 6,
  },

  button: {
    backgroundColor: '#C17C74',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});