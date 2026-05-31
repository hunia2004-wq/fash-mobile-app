import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getFaqs } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(prev => (prev === id ? null : id));
  };

  const filteredFAQ = faqs.filter(item =>
    item.question.toLowerCase().includes(query.toLowerCase()) ||
    item.answer.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = await getToken();
        const data = await getFaqs(token);
        setFaqs(Array.isArray(data) ? data : data?.data || []);
      } catch (e) { Alert.alert("Error", "Failed to load FAQs"); }
      finally { setLoading(false); }
    };
    fetchFaqs();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput style={styles.searchInput} placeholder="Search Inquiry..." placeholderTextColor="#7A6060" value={query} onChangeText={setQuery} />
        <View style={styles.card}>
          {filteredFAQ.map((item, index) => (
            <View key={item._id} style={[styles.faqItem, index < filteredFAQ.length - 1 && styles.faqBorder]}>
              <TouchableOpacity style={styles.questionRow} onPress={() => toggle(item._id)}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.chevron}>{openId === item._id ? '˄' : '›'}</Text>
              </TouchableOpacity>
              {openId === item._id && <Text style={styles.answerText}>{item.answer}</Text>}
            </View>
          ))}
          {filteredFAQ.length === 0 && <Text style={{ padding: wp(16), color: '#7A6060', fontSize: fp(13) }}>No results found</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  scrollContent: { padding: wp(16) },
  searchInput: { backgroundColor: '#EDE0D8', borderRadius: wp(12), padding: wp(12), fontSize: fp(14), color: '#2C1F1F', marginBottom: hp(12) },
  card: { backgroundColor: '#F2E6E3', borderRadius: wp(16), overflow: 'hidden' },
  faqItem: { padding: wp(16) },
  faqBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  questionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { fontSize: fp(14), fontWeight: '600', color: '#2C1F1F', flex: 1, paddingRight: wp(8) },
  chevron: { fontSize: fp(18), color: '#7A6060' },
  answerText: { fontSize: fp(13), color: '#7A6060', marginTop: hp(10), lineHeight: hp(20) },
});