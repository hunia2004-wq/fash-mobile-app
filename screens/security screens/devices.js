import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getLoginDevices, removeDevice } from '../../services/authService';
import { logoutAllDevices } from '../../services/authService';


const LoginDevicesScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = await getToken();
        const data = await getLoginDevices(token);

        setDevices(data.devices || []); 
        setCurrentDeviceId(data.currentDeviceId); 
      } catch (e) {
        Alert.alert('Error', 'Failed to load devices.');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);


  const handleRemove = (id) => {
    Alert.alert('Remove Device', 'Sign out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
  
            setRemovingId(id);
  
            await removeDevice(token, id);
  
            setDevices((prev) => prev.filter((d) => d._id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to remove device.');
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]);
  };


  const handleSignOutAll = async () => {
    try {
      setActionLoading(true);
  
      const token = await getToken();
      await logoutAllDevices(token);
      setDevices([]);
  
    } catch (e) {
      Alert.alert('Error', 'Failed to sign out devices.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Devices</Text>
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
        <Text style={styles.headerTitle}>Active Devices</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Active Sessions</Text>

        <View style={styles.card}>
          {devices.map((device, index) => (
            <View
              key={device._id}
              style={[
                styles.deviceItem,
                index < devices.length - 1 && styles.deviceBorder,
              ]}
            >
              <Text style={styles.deviceName}>{device.deviceName}</Text>

              <Text style={styles.deviceMeta}>{device.deviceType} · {device.ip}</Text>

              <Text>Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString(): 'Unknown'}</Text>

              {device._id === currentDeviceId ? (
                <Text>This device</Text>
              ) : (
                <TouchableOpacity onPress={() => handleRemove(device._id)}>
                  <Text style={styles.removeBtn}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOutAll}>
          <Text style={styles.dangerBtnText}>Sign Out From Other Devices</Text>
        </TouchableOpacity>
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

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C17C74',
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