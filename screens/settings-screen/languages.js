// ─── LanguagesScreen.js ──────────────────────────────────────────────────────
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updateLanguage, getSettings } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../source/i18n';
import { wp, hp, fp } from '../../utils/responsive';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
];

const LanguagesScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [selected, setSelected] = useState('en');

  const loadLanguage = async () => {
    try {
      const token = await getToken();
      const settings = await getSettings(token);
      const lang = settings.language ?? 'en';
      setSelected(lang);
      i18n.changeLanguage(lang);
    } catch (e) { setSelected('en'); }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadLanguage);
    return unsubscribe;
  }, [navigation]);

  const handleLanguageChange = async (language) => {
    if (language === selected) return;
    const token = await getToken();
    const previous = selected;
    setSelected(language);
    i18n.changeLanguage(language);
    try { await updateLanguage(token, { language }); }
    catch (e) { Alert.alert("Error", "Failed to update language"); setSelected(previous); i18n.changeLanguage(previous); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity key={lang.code} style={[styles.listItem, index < LANGUAGES.length - 1 && styles.listItemBorder]} onPress={() => handleLanguageChange(lang.code)}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{lang.label}</Text>
                <Text style={styles.itemSubtitle}>{lang.native}</Text>
              </View>
              {selected === lang.code && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
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
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: wp(16) },
  listItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  itemLeft: { flex: 1 },
  itemTitle: { fontSize: fp(15), fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: fp(12), color: '#7A6060', marginTop: hp(2) },
  checkmark: { fontSize: fp(18), color: '#C17C74', fontWeight: '700' },
});

export default LanguagesScreen;