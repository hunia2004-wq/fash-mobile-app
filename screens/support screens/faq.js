import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { getFaqs } from '../../services/authService';


if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQScreen = ({ navigation }) => {
  const { getToken } = useContext(AuthContext);

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const filteredFAQ = faqs.filter((item) =>
    item.question.toLowerCase().includes(query.toLowerCase()) ||
    item.answer.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const token = await getToken();
        const data = await getFaqs(token);
        setFaqs(data || []);
      } catch (e) {
        Alert.alert("Error", "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search Inquiry..."
          placeholderTextColor="#7A6060"
          value={query}
          onChangeText={setQuery}
        />

        {/* faq list — uses filteredFAQ */}
        <View style={styles.card}>
          {filteredFAQ.map((item, index) => (
            <View
              key={item.id}
              style={[styles.faqItem, index < filteredFAQ.length - 1 && styles.faqBorder]}
            >
              <TouchableOpacity style={styles.questionRow} onPress={() => toggle(item.id)}>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.chevron}>{openId === item.id ? '˄' : '›'}</Text>
              </TouchableOpacity>
              {openId === item.id && (
                <Text style={styles.answerText}>{item.answer}</Text>
              )}
            </View>
          ))}

          {filteredFAQ.length === 0 && (
            <Text style={{ padding: 16, color: '#7A6060' }}>No results found</Text>
          )}
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
  searchInput: { backgroundColor: '#EDE0D8', borderRadius: 12, padding: 12, fontSize: 14, color: '#2C1F1F', marginBottom: 12 },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, overflow: 'hidden' },
  faqItem: { padding: 16 },
  faqBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  questionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { fontSize: 14, fontWeight: '600', color: '#2C1F1F', flex: 1, paddingRight: 8 },
  chevron: { fontSize: 18, color: '#7A6060' },
  answerText: { fontSize: 13, color: '#7A6060', marginTop: 10, lineHeight: 20 },
});

export default FAQScreen;