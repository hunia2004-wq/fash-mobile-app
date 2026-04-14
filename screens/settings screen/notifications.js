import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updateNotifications } from '../../services/authService';
import { useEffect } from 'react';
import { getSettings } from '../../services/authService';

const NotificationsScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState({
    push: false,
    email: false,
    orders: false,
    promotions: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);


  const fetchSettings = async () => {
    try {
      const token = await getToken();
      const data = await getSettings(token);
  
      const n = data.notifications || {};
  
      setNotifications({
        push: n.pushNotifications ?? false,
        email: n.emailNotifications ?? false,
        orders: n.orders ?? false,
        promotions: n.promotions ?? false,
      });
  
    } catch (e) {
      console.log("FETCH ERROR:", e);
    }
  };

  const handleToggle = async (key, value) => {
    const token = await getToken();
  
    // 1. compute next state safely
    setNotifications(prev => {
      return { ...prev, [key]: value };
    });
  
    // 2. get latest state manually (IMPORTANT FIX)
    const updated = {
      ...notifications,
      [key]: value,
    };
  
    // 3. send API separately
    try {
      await updateNotifications(token, {
        emailNotifications: updated.email,
        pushNotifications: updated.push,
        orders: updated.orders,
        promotions: updated.promotions,
      });
    } catch (err) {
      console.log("Update failed:", err.message);
    }
  };

const sendUpdate = async (token, updated) => {
  try {
    await updateNotifications(token, {
      emailNotifications: updated.email,
      pushNotifications: updated.push,
    });
  } catch (err) {
    console.log("Update failed:", err.message);
  }
};

  const ToggleRow = ({ label, subtitle, value, onValueChange, isLast }) => (
    <View style={[styles.toggleRow, !isLast && styles.toggleRowBorder]}>
      <View style={styles.toggleLeft}>
        <Text style={styles.itemTitle}>{label}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
  
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ccc', true: '#C17C74' }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Channels</Text>
        <View style={styles.card}>
        <ToggleRow
  label="Push Notifications"
  value={notifications.push}
  onValueChange={(v) => handleToggle('push', v)}
/>

<ToggleRow
  label="Email Notifications"
  value={notifications.email}
  onValueChange={(v) => handleToggle('email', v)}
/>
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Order Updates"
            subtitle="Status changes and delivery"
            value={notifications.orders}
onValueChange={(v) => handleToggle('orders', v)}
          />
          <ToggleRow
            label="Promotions & Offers"
            subtitle="Deals, sales, and new arrivals"
            value={notifications.promotions}
onValueChange={(v) => handleToggle('promotions', v)}
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, position: 'relative' },
  backBtn: { fontSize: 28, color: '#C17C74', lineHeight: 32 },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  scrollContent: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#7A6060', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 },
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  toggleRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  toggleLeft: { flex: 1, paddingRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: 12, color: '#7A6060', marginTop: 2 },
});

export default NotificationsScreen;