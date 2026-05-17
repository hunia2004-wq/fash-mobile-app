import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updatePrivacy, getSettings } from '../../services/authService';
import { Ionicons} from '@expo/vector-icons';


const PrivacyScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [privacy, setPrivacy] = useState({
  profileVisible: true,
  showActivity: false,
  dataCollection: false,
  });

  const handleToggle = async (key, value) => {
    const token = await getToken();
  
    const previous = { ...privacy }; // ✅ store old state
  
    const updated = {
      ...privacy,
      [key]: value,
    };
  
    setPrivacy(updated);
  
    try {
      await updatePrivacy(token, updated); 
      
    } catch (err) {
      console.log(err.message);
      setPrivacy(previous); 
      Alert.alert("Update failed");
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = await getToken();
        const data = await getSettings(token);
  
        setPrivacy({
          profileVisible: data?.privacy?.profileVisible ?? true,
          showActivity: data?.privacy?.showActivity ?? false,
          dataCollection: data?.privacy?.dataCollection ?? false,
        });
      } catch (err) {
        console.log("Failed to load settings", err.message);
      }
    };
  
    loadSettings();
  }, []);

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
      <TouchableOpacity
  style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' }}
  onPress={() => navigation.goBack()}
  activeOpacity={0.8}
>
  <Ionicons name="arrow-back" size={20} color="#2c2c2c" />
</TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

        <ToggleRow
  label="Public Profile"
  value={privacy.profileVisible}
  onValueChange={(v) => handleToggle('profileVisible', v)}
/>

<ToggleRow
  label="Show Activity"
  value={privacy.showActivity}
  onValueChange={(v) => handleToggle('showActivity', v)}
/>

<ToggleRow
  label="Data Collection"
  value={privacy.dataCollection}
  onValueChange={(v) => handleToggle('dataCollection', v)}
  isLast
/>     
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your privacy matters to us. We never sell your data to third parties.
          </Text>
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
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  toggleRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  toggleLeft: { flex: 1, paddingRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: 12, color: '#7A6060', marginTop: 2 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: 13, color: '#C17C74', fontWeight: 'bold', lineHeight: 20 },
});

export default PrivacyScreen;