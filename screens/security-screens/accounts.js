import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getConnectedAccount, toggleConnectedAccount } from '../../services/authService';

const ConnectedAccountsScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = await getToken();
        const data = await getConnectedAccount(token);
  
        const backendAccounts = data.connectedAccounts || {};

  
        const defaultAccounts = [
          { id: 'google', name: 'Google', icon: 'G' },
          { id: 'facebook', name: 'Facebook', icon: 'f' },
          { id: 'twitter', name: 'X (Twitter)', icon: '𝕏' },
          { id: 'apple', name: 'Apple', icon: '' },
        ];
  
        const merged = defaultAccounts.map((acc) => ({
          ...acc,
          connected: backendAccounts?.[acc.id] ?? false,
        }));
  
        setAccounts(merged);
  
      } catch (e) {
        setAccounts([
          { id: 'google', name: 'Google', icon: 'G', connected: false },
          { id: 'facebook', name: 'Facebook', icon: 'f', connected: false },
          { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', connected: false },
          { id: 'apple', name: 'Apple', icon: '', connected: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAccounts();
  }, []);

  const handleToggle = async (id) => {
    const token = await getToken();
  
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
  
    const newValue = !account.connected;
  
    setUpdatingId(id);
  
    try {
      await toggleConnectedAccount(token, {
        [id]: newValue,
      });
  
      const data = await getConnectedAccount(token);
      const backendAccounts = data.connectedAccounts || {};
  
      setAccounts((prev) =>
        prev.map((a) => ({
          ...a,
          connected: backendAccounts[a.id] ?? false,
        }))
      );
  
    } catch (e) {
      console.log("CONNECTED ACC ERROR:", e.message);
      Alert.alert('Error', e.message);
    }
    finally {
      setUpdatingId(null);
    }
  };



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connected Accounts</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#C17C74" />
        </View>
      </SafeAreaView>
    );
  }


  return (

    <SafeAreaView style={styles.container}>

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Connected Accounts</Text>

        {/* placeholder to balance */}
      <View style={{ width: 40 }} />
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
              disabled={updatingId === account.id}
                style={[
                  styles.toggleBtn,
                  account.connected ? styles.btnDisconnect : styles.btnConnect,
                  updatingId === account.id && { opacity: 0.5 },
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
    position: 'relative',
  },

  backBtn: {
    fontSize: 26,
    color: '#C17C74',
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