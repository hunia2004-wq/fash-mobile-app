import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


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
      title: 'Active Devices',
      subtitle: 'Active sessions',
      screen: 'LoginDevicesScreen',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
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
            Your account security settings help protect your personal information and control how your account is accessed across devices and sessions.
          </Text>
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