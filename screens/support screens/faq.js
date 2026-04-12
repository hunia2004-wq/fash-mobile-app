import React, { useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager,} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQ_ITEMS = [
  {
    id: '1',
    question: 'How do I track my order?',
    answer: 'Go to Activity → Orders, tap your order, then tap "Track Shipment" to see live updates.',
  },
  {
    id: '2',
    question: 'Can I return an item?',
    answer:
      'Yes, within 14 days of delivery. Items must be unworn with original tags. Start a return from Orders.',
  },
  {
    id: '3',
    question: 'How do I change my address?',
    answer:
      "If your order hasn't shipped yet, contact support immediately. Otherwise update it in Profile → Edit.",
  },
  {
    id: '4',
    question: 'What payment methods are accepted?',
    answer:
      'We accept Visa, Mastercard, Apple Pay, Google Pay, and cash on delivery in select areas.',
  },
  {
    id: '5',
    question: 'Why was my order cancelled?',
    answer:
      "This usually happens due to stock issues or payment failure. You won't be charged. Try reordering.",
  },
  {
    id: '6',
    question: 'How do I delete my account?',
    answer:
      "Contact support and we'll process your request within 7 business days. All data is permanently removed.",
  },
];

const FAQScreen = ({ navigation }) => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {FAQ_ITEMS.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.faqItem,
                index < FAQ_ITEMS.length - 1 && styles.faqBorder,
              ]}
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
        </View>
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
  },

  card: {
    backgroundColor: '#F2E6E3',
    borderRadius: 16,
    overflow: 'hidden',
  },

  faqItem: {
    padding: 16,
  },

  faqBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1F1F',
    flex: 1,
    paddingRight: 8,
  },

  chevron: {
    fontSize: 18,
    color: '#7A6060',
  },

  answerText: {
    fontSize: 13,
    color: '#7A6060',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default FAQScreen;