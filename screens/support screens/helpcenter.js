import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

const articles = [
  { id: '1', title: 'How to place an order', desc: 'Step-by-step guide to buying items' },
  { id: '2', title: 'Tracking your shipment', desc: 'Find your package status anytime' },
  { id: '3', title: 'Returns & refunds policy', desc: "What's eligible and how to request" },
  { id: '4', title: 'Payment methods accepted', desc: 'Cards, wallets, and more' },
  { id: '5', title: 'Changing or cancelling an order', desc: 'Before and after it ships' },
  { id: '6', title: 'Account & password help', desc: 'Login issues and security tips' },
];

const HelpCenterScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          placeholderTextColor="#7A6060"
          value={query}
          onChangeText={setQuery}
        />

        <Text style={styles.sectionLabel}>Popular Topics</Text>

        <View style={styles.card}>
          {filtered.map((article, index) => (
            <TouchableOpacity
              key={article.id}
              style={[
                styles.articleItem,
                index < filtered.length - 1 && styles.articleBorder,
              ]}
              onPress={() => {
                // navigate to article detail screen
                // navigation.navigate('ArticleDetailScreen', { article })
              }}
            >
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleDesc}>{article.desc}</Text>
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No articles found for "{query}"</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE6',
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
    color: '#8B5A5A',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C1F1F',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#EDE0D8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#2C1F1F',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A6060',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#EDE0D8',
    borderRadius: 16,
    overflow: 'hidden',
  },
  articleItem: {
    padding: 16,
  },
  articleBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C1F1F',
  },
  articleDesc: {
    fontSize: 12,
    color: '#7A6060',
    marginTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#7A6060',
  },
});

export default HelpCenterScreen;