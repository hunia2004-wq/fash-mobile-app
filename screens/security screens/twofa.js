import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';

const TwoFactorAuthScreen = ({ navigation }) => {
  const [authApp, setAuthApp] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(false);

  const backupOptions = [
    { id: 'view', title: 'View Backup Codes', screen: 'ViewBackupCodesScreen' },
    { id: 'regen', title: 'Regenerate Codes', screen: 'RegenerateCodesScreen' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Auth</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Two-factor authentication adds an extra layer of security to your account by requiring a
            code in addition to your password.
          </Text>
        </View>

        {/* Toggle Options */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Text style={styles.itemTitle}>Authenticator App</Text>
              <Text style={styles.itemSubtitle}>Google Authenticator, Authy</Text>
            </View>
            <Switch
              value={authApp}
              onValueChange={setAuthApp}
              trackColor={{ false: '#ccc', true: '#B07070' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.toggleRow, styles.rowBorder]}>
            <View style={styles.toggleLeft}>
              <Text style={styles.itemTitle}>SMS Verification</Text>
              <Text style={styles.itemSubtitle}>Text message to +20 *** ***4821</Text>
            </View>
            <Switch
              value={sms}
              onValueChange={setSms}
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
              value={email}
              onValueChange={setEmail}
              trackColor={{ false: '#ccc', true: '#B07070' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Backup Section */}
        <Text style={styles.sectionLabel}>Backup</Text>
        <View style={styles.card}>
          {backupOptions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                index < backupOptions.length - 1 && styles.listItemBorder,
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE6',
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
    color: '#8B5A5A',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C1F1F',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  infoBox: {
    backgroundColor: 'rgba(74,110,154,0.1)',
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#4A6E9A',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#EDE0D8',
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