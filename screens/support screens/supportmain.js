import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity,} from 'react-native';

const SupportScreen = ({ navigation }) => {
  const options = [
    {
      id: 'help',
      title: 'Help Center',
      subtitle: 'Browse articles & guides',
      screen: 'HelpCenterScreen',
    },
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'We reply within 24h',
      screen: 'ContactSupportScreen',
    },
    {
      id: 'faq',
      title: 'FAQ',
      subtitle: 'Common questions',
      screen: 'FAQScreen',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Options Card */}
        <View style={styles.card}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.listItem,
                index < options.length - 1 && styles.listItemBorder,
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Need urgent help? Email us at support@yourapp.com or call +1 (800) 000-0000.
          </Text>
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
  card: {
    backgroundColor: '#EDE0D8',
    borderRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C1F1F',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#7A6060',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#7A6060',
  },
  infoBox: {
    backgroundColor: 'rgba(74,110,154,0.1)',
    borderRadius: 12,
    padding: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#4A6E9A',
    lineHeight: 20,
  },
});

export default SupportScreen;