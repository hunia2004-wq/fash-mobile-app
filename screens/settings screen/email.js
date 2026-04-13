import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EmailScreen = ({ navigation, route }) => {
  const user = route.params?.user || {};
  const [email, setEmail] = useState(user.email || '');

  const handleSave = () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Email cannot be empty.');
      return;
    }
    // TODO: call update email API
    Alert.alert('Saved', 'Your email has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Address</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Changing your email will require you to verify the new address.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#B09090"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { fontSize: 28, color: '#C17C74', lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#C17C74' },
  saveBtn: { fontSize: 15, color: '#C17C74', fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: 13, color: '#C17C74', fontWeight: 'bold', lineHeight: 20 },
  card: { backgroundColor: '#F2E6E3', borderRadius: 16, padding: 16 },
  fieldGroup: { paddingBottom: 0 },
  fieldLabel: { fontSize: 11, color: '#7A6060', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: '#2C1F1F' },
});

export default EmailScreen;