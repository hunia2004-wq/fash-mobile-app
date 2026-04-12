import React, { useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,} from 'react-native';

const ConnectedAccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([
    { id: 'google', name: 'Google', icon: 'G', connected: true },
    { id: 'facebook', name: 'Facebook', icon: 'f', connected: true },
    { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', connected: false },
    { id: 'apple', name: 'Apple', icon: '', connected: false },
  ]);

  const handleToggle = (id) => {
    const account = accounts.find((a) => a.id === id);
    const action = account.connected ? 'Disconnect' : 'Connect';

    Alert.alert(`${action} ${account.name}`, `Are you sure you want to ${action.toLowerCase()} your ${account.name} account?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action,
        style: account.connected ? 'destructive' : 'default',
        onPress: () =>
          setAccounts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, connected: !a.connected } : a))
          ),
      },
    ]);
  };

  return (
    <View style={styles.container}>

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Accounts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Link social accounts to sign in faster. We never post without your permission.
          </Text>
        </View>

        <View style={styles.card}>
          {accounts.map((account, index) => (
            <View
              key={account.id}
              style={[
                styles.accountRow,
                index < accounts.length - 1 && styles.rowBorder,
              ]}
            >
              {/* icon */}
              <View style={styles.accountIcon}>
                <Text style={styles.accountIconText}>{account.icon}</Text>
              </View>

              {/* info */}
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text
                  style={[
                    styles.accountStatus,
                    account.connected ? styles.statusConnected : styles.statusDisconnected,
                  ]}
                >
                  {account.connected ? '✓ Connected' : 'Not connected'}
                </Text>
              </View>

              {/* button */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  account.connected ? styles.btnDisconnect : styles.btnConnect,
                ]}
                onPress={() => handleToggle(account.id)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    account.connected ? styles.btnTextDisconnect : styles.btnTextConnect,
                  ]}
                >
                  {account.connected ? 'Disconnect' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 10,
  },

  backBtn: {
    fontSize: 28,
    color: '#C17C74',
    lineHeight: 32,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#C17C74',
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
    borderColor: '#C17C74'
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

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },

  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FDFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C1F1F',
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1F1F',
  },

  accountStatus: {
    fontSize: 12,
    marginTop: 2,
  },

  statusConnected: {
    color: '#5A8B6A',
  },

  statusDisconnected: {
    color: '#7A6060',
  },

  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  btnConnect: {
    backgroundColor: 'rgba(90,139,106,0.15)',
  },

  btnDisconnect: {
    backgroundColor: 'rgba(192,68,74,0.1)',
  },

  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  btnTextConnect: {
    color: '#5A8B6A',
  },
  
  btnTextDisconnect: {
    color: '#C0444A',
  },
});

export default ConnectedAccountsScreen;