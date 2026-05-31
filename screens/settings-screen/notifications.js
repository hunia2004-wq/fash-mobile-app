// ─── NotificationsScreen.js ──────────────────────────────────────────────────
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updateNotifications, getSettings, submitPushToken, removePushToken } from '../../services/authService';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { wp, hp, fp } from '../../utils/responsive';

const NotificationsScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState({ push: false, email: false, order: false, promotions: false });

  useFocusEffect(useCallback(() => { fetchSettings(); }, []));

  const fetchSettings = async () => {
    try {
      const token = await getToken();
      const data = await getSettings(token);
      const n = data.notifications || {};
      setNotifications({ push: n.pushNotifications ?? false, email: n.emailNotifications ?? false, order: n.orderUpdates ?? false, promotions: n.promotionsOffers ?? false });
    } catch (e) { console.log("FETCH ERROR:", e); }
  };

  const registerPushToken = async (token) => {
    if (!Device.isDevice) return true;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') { const { status } = await Notifications.requestPermissionsAsync(); finalStatus = status; }
    if (finalStatus !== 'granted') { Alert.alert('Permission Required', 'Please enable notifications in your device settings.'); return false; }
    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId });
    await submitPushToken(token, pushTokenData.data);
    return true;
  };

  const handleToggle = async (key, value) => {
    const token = await getToken();
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    if (key === 'push') {
      if (value) { const success = await registerPushToken(token); if (!success) { setNotifications(prev => ({ ...prev, push: false })); return; } }
      else { await removePushToken(token).catch(() => {}); }
    }
    try { await updateNotifications(token, { emailNotifications: updated.email, pushNotifications: updated.push, orderUpdates: updated.order, promotionsOffers: updated.promotions }); }
    catch (err) { console.log('Update failed:', err.message); }
  };

  const ToggleRow = ({ label, subtitle, value, onValueChange, isLast }) => (
    <View style={[styles.toggleRow, !isLast && styles.toggleRowBorder]}>
      <View style={styles.toggleLeft}>
        <Text style={styles.itemTitle}>{label}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#ccc', true: '#C17C74' }} thumbColor="#fff" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Channels</Text>
        <View style={styles.card}>
          <ToggleRow label="Push Notifications" value={notifications.push} onValueChange={(v) => handleToggle('push', v)} />
          <ToggleRow label="Email Notifications" value={notifications.email} onValueChange={(v) => handleToggle('email', v)} isLast />
        </View>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <ToggleRow label="Order Updates" subtitle="Status changes and delivery" value={notifications.order} onValueChange={(v) => handleToggle('order', v)} />
          <ToggleRow label="Promotions & Offers" subtitle="Deals, sales, and new arrivals" value={notifications.promotions} onValueChange={(v) => handleToggle('promotions', v)} isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  sectionLabel: { fontSize: fp(11), fontWeight: '700', color: '#7A6060', letterSpacing: 1, textTransform: 'uppercase', marginLeft: wp(4) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(16) },
  toggleRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  toggleLeft: { flex: 1, paddingRight: wp(12) },
  itemTitle: { fontSize: fp(15), fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: fp(12), color: '#7A6060', marginTop: hp(2) },
});

export default NotificationsScreen;