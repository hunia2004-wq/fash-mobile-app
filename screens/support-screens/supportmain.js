import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

const SupportScreen = ({ navigation }) => {
  const options = [
    { id: 'contact', title: 'Contact Support', subtitle: 'We reply within 24 hours', screen: 'ContactSupportScreen' },
    { id: 'faq', title: 'Frequently Asked Questions', subtitle: 'Common questions', screen: 'FAQScreen' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {options.map((item, index) => (
            <TouchableOpacity key={item.id} style={[styles.listItem, index < options.length - 1 && styles.listItemBorder]} onPress={() => navigation.navigate(item.screen)}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Need urgent help? Email us at support@fash.com or call (+20) 000 00 00 000.</Text>
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
  chevron: { fontSize: fp(20), color: '#7A6060' },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', fontWeight: 'bold', lineHeight: hp(20) },
});

export default SupportScreen;