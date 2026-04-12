import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity,} from 'react-native';

const SecurityScreen = ({ navigation }) => {
  const options = [
    {
      id: '2fa',
      title: 'Two-Factor Authentication',
      subtitle: 'Add extra protection',
      screen: 'TwoFactorAuthScreen',
    },
    {
      id: 'devices',
      title: 'Login Devices',
      subtitle: '3 active sessions',
      screen: 'LoginDevicesScreen',
    },
    {
      id: 'connected',
      title: 'Connected Accounts',
      subtitle: 'Google, Facebook',
      screen: 'ConnectedAccountsScreen',
    },
  ];

  return (
    <View style={styles.container}>

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* options Card */}
        <View style={styles.card}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                index < options.length - 1 && styles.listItemBorder,
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* info box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your account was last accessed on Apr 12, 2026 from iPhone 15 Pro in Cairo, Egypt.
          </Text>
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

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    overflow: 'hidden',
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

  itemLeft: {
    flex: 1,
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

  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#C17C74"
  },

  infoText: {
    fontSize: 13,
    color: '#C17C74',
    lineHeight: 20,
    fontWeight: 'bold',
  },
});

export default SecurityScreen;