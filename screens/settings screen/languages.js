import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { updateLanguage, getSettings } from '../../services/authService';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

const LanguagesScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [selected, setSelected] = useState('en');


  const loadLanguage = async () => {
    try {
      const token = await getToken();
      const settings = await getSettings(token);
  
      const lang = settings.language || 'en';
      setSelected(lang);
  
    } catch (e) {
      console.log("ERROR LOADING LANGUAGE:", e);
      setSelected('en');
    }
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

  try {
    await updateLanguage(token, { language });
  } catch (e) {
    Alert.alert("Error", "Failed to update language");
    setSelected(previous);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.listItem,
                index < LANGUAGES.length - 1 && styles.listItemBorder
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{lang.label}</Text>
                <Text style={styles.itemSubtitle}>{lang.native}</Text>
              </View>

              {selected === lang.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
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
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  itemLeft: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '500', color: '#2C1F1F' },
  itemSubtitle: { fontSize: 12, color: '#7A6060', marginTop: 2 },
  checkmark: { fontSize: 18, color: '#C17C74', fontWeight: '700' },
});

export default LanguagesScreen;