import React, { useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,} from 'react-native';

const LoginDevicesScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([
    {
      id: '1',
      name: 'iPhone 15 Pro',
      location: 'Cairo, Egypt',
      date: 'Apr 12, 2026',
      isCurrent: true,
    },
    {
      id: '2',
      name: 'MacBook Pro',
      location: 'Cairo, Egypt',
      date: 'Apr 10, 2026',
      isCurrent: false,
    },
    {
      id: '3',
      name: 'Chrome on Windows',
      location: 'Alexandria, Egypt',
      date: 'Apr 5, 2026',
      isCurrent: false,
    },
  ]);

  const handleRemove = (id) => {
    Alert.alert('Remove Device', 'Sign out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setDevices((prev) => prev.filter((d) => d.id !== id)),
      },
    ]);
  };

  const handleSignOutAll = () => {
    Alert.alert('Sign Out All', 'This will sign out all other devices. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out All',
        style: 'destructive',
        onPress: () => setDevices((prev) => prev.filter((d) => d.isCurrent)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login Devices</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Active Sessions</Text>

        <View style={styles.card}>
          {devices.map((device, index) => (
            <View
              key={device.id}
              style={[
                styles.deviceItem,
                index < devices.length - 1 && styles.deviceBorder,
              ]}
            >
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>
                {device.location} · {device.date}
              </Text>

              {device.isCurrent ? (
                <Text style={styles.currentLabel}>✓ This device</Text>
              ) : (
                <TouchableOpacity onPress={() => handleRemove(device.id)}>
                  <Text style={styles.removeBtn}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOutAll}>
          <Text style={styles.dangerBtnText}>Sign Out All Other Devices</Text>
        </TouchableOpacity>
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

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6060',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 4,
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    overflow: 'hidden',
  },

  deviceItem: {
    padding: 16,
  },

  deviceBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },

  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1F1F',
  },

  deviceMeta: {
    fontSize: 12,
    color: '#7A6060',
    marginTop: 2,
  },

  currentLabel: {
    fontSize: 12,
    color: '#5A8B6A',
    fontWeight: '600',
    marginTop: 4,
  },

  removeBtn: {
    fontSize: 12,
    color: '#C0444A',
    marginTop: 4,
  },

  dangerBtn: {
    backgroundColor: 'rgba(192,68,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192,68,74,0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C0444A',
  },
});

export default LoginDevicesScreen;