import React, { useState, useContext } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { toggle2FA } from '../../services/authService';

const TwoFactorAuthScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [twoFA, setTwoFA] = useState({
    authApp: true,
    sms: false,
    email: false,
  });
  const [loading, setLoading] = useState(false); 


  const backupOptions = [
    { id: 'view', title: 'View Backup Codes', screen: 'ViewBackupCodesScreen' },
    { id: 'regen', title: 'Regenerate Codes', screen: 'RegenerateCodesScreen' },
  ];

  const handleToggle = async (key, value) => {
    try {
      const token = await getToken();
  
      // 1. update local state ONLY for that key
      setTwoFA(prev => ({
        ...prev,
        [key]: value,
      }));
  
      // 2. send to backend
      await toggle2FA(token, {
        method: key,
        enabled: value,
      });
  
    } catch (e) {
      Alert.alert('Error', 'Failed to update 2FA settings.');
    }
  };

  return (

    <SafeAreaView style={styles.container}>

      {/* header */}
     <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backBtn}>‹</Text>
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Two-Factor Authentication</Text>

  {/* balance right side */}
  <View style={{ width: 40 }} />
</View>


      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Two-factor authentication adds an extra layer of security to your account by requiring a
            code in addition to your password.
          </Text>
        </View>

        {/* toggle options */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.itemTitle}>Authenticator App</Text>
              <Text style={styles.itemSubtitle}>Google Authenticator, Authy</Text>
            </View>
            <Switch
  value={twoFA.authApp}
  onValueChange={(v) => handleToggle('authApp', v)}
  trackColor={{ false: '#ccc', true: '#B07070' }}
  thumbColor="#fff"
/>
          </View>

          <View style={[styles.toggleRow, styles.rowBorder]}>
            <View style={styles.toggleLeft}>
              <Text style={styles.itemTitle}>SMS Verification</Text>
              <Text style={styles.itemSubtitle}>Text message to +20 *** ***9856</Text>
            </View>
            <Switch
  value={twoFA.sms}
  onValueChange={(v) => handleToggle('sms', v)}
  trackColor={{ false: '#ccc', true: '#B07070' }}
  thumbColor="#fff"
/>
          </View>

          <View style={[styles.toggleRow, styles.rowBorder]}>
            <View style={styles.toggleLeft}>
              <Text style={styles.itemTitle}>Email Verification</Text>
              <Text style={styles.itemSubtitle}>aynourhamadaa@gmail.com</Text>
            </View>
            <Switch
  value={twoFA.email}
  onValueChange={(v) => handleToggle('email', v)}
  trackColor={{ false: '#ccc', true: '#B07070' }}
  thumbColor="#fff"
/>
          </View>
        </View>
      </ScrollView>
  </SafeAreaView>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

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
    lineHeight: 32,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#C17C74',
    pointerEvents: 'none',
  },

  scrollContent: {
    padding: 16,
    gap: 12,
  },

  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },

  infoText: {
    fontSize: 13,
    color: '#C17C74',
    lineHeight: 20,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    overflow: 'hidden',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(140,100,100,0.2)',
  },

  toggleLeft: {
    flex: 1,
    paddingRight: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6060',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginTop: 4,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C1F1F',
  },

  itemSubtitle: {
    fontSize: 12,
    color: '#7A6060',
    marginTop: 2,
  },

  chevron: {
    fontSize: 20,
    color: '#7A6060',
  },
});

export default TwoFactorAuthScreen;