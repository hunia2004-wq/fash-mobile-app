// ─── PrivacyScreen.js ────────────────────────────────────────────────────────
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updatePrivacy, getSettings } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

const PrivacyScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [privacy, setPrivacy] = useState({ profileVisible: true, showActivity: false, dataCollection: false });

  const handleToggle = async (key, value) => {
    const token = await getToken();
    const previous = { ...privacy };
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    try { await updatePrivacy(token, updated); }
    catch (err) { setPrivacy(previous); Alert.alert("Update failed"); }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = await getToken();
        const data = await getSettings(token);
        setPrivacy({ profileVisible: data?.privacy?.profileVisible ?? true, showActivity: data?.privacy?.showActivity ?? false, dataCollection: data?.privacy?.dataCollection ?? false });
      } catch (err) { console.log("Failed to load settings", err.message); }
    };
    loadSettings();
  }, []);

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
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <ToggleRow label="Public Profile" value={privacy.profileVisible} onValueChange={(v) => handleToggle('profileVisible', v)} />
          <ToggleRow label="Show Activity" value={privacy.showActivity} onValueChange={(v) => handleToggle('showActivity', v)} />
          <ToggleRow label="Data Collection" value={privacy.dataCollection} onValueChange={(v) => handleToggle('dataCollection', v)} isLast />
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Your privacy matters to us. We never sell your data to third parties.</Text>
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
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(16) },
  toggleRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  toggleLeft: { flex: 1, paddingRight: wp(12) },
  itemTitle: { fontSize: fp(15), fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: fp(12), color: '#7A6060', marginTop: hp(2) },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', fontWeight: 'bold', lineHeight: hp(20) },
});

export default PrivacyScreen;