import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { contactSupport } from '../../services/authService';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { wp, hp, fp } from '../../utils/responsive';

const SUBJECTS = ['Order issue','Payment problem','Account issue','Delivery issue','Help Request','Report a problem','Other'];

const ContactSupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState(null);
  const { getToken } = useContext(AuthContext);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSend = async () => {
    if (!subject || !message.trim()) { Alert.alert('Missing info', 'Please complete all required fields.'); return; }
    setSending(true);
    try {
      const token = await getToken();
      const response = await contactSupport(token, { subject, orderNumber, message, image });
      const ticketId = response?.ticketId;
      const status = response?.status;
      Alert.alert('Message Sent', `We'll get back to you within 24 hours.\n\nTicket #${ticketId}\nStatus: ${status}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message || 'Failed to send message. Please try again.'); }
    finally { setSending(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={wp(20)} color="#2c2c2c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>We aim to reply within 24 hours. For urgent issues, call (+20) 000 00 00 000.</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Subject</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowSubjectPicker(!showSubjectPicker)}>
            <Text style={styles.inputText}>{subject}</Text>
            <Text style={styles.chevron}>{showSubjectPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSubjectPicker && (
            <View style={styles.pickerDropdown}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity key={s} style={styles.pickerOption} onPress={() => { setSubject(s); setShowSubjectPicker(false); }}>
                  <Text style={[styles.pickerOptionText, s === subject && styles.pickerSelected]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Order number (optional)</Text>
          <TextInput style={styles.input} placeholder="#ORD-00000" placeholderTextColor="#7A6060" value={orderNumber} onChangeText={setOrderNumber} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Describe your issue</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Tell us what happened..." placeholderTextColor="#7A6060" value={message} onChangeText={setMessage} multiline textAlignVertical="top" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Attach a photo (optional)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            <Text style={styles.uploadText}>{image ? 'Image selected ✓' : '+ Add image'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send Message</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactSupportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingBottom: hp(12) },
  backBtn: { width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#F2E6E3', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: fp(17), fontWeight: '700', color: '#C17C74', pointerEvents: 'none' },
  scrollContent: { padding: wp(16), gap: hp(12) },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: wp(12), padding: wp(14), borderWidth: 1.5, borderColor: '#C17C74' },
  infoText: { fontSize: fp(13), color: '#C17C74', fontWeight: 'bold', lineHeight: hp(20) },
  formGroup: { gap: hp(6) },
  formLabel: { fontSize: fp(12), color: '#C17C74', fontWeight: '500' },
  input: { backgroundColor: '#F2E6E3', borderRadius: wp(12), padding: wp(12), fontSize: fp(14), color: '#2C1F1F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputText: { fontSize: fp(14), color: '#2C1F1F' },
  chevron: { fontSize: fp(11), color: '#7A6060' },
  textarea: { height: hp(100), alignItems: 'flex-start' },
  pickerDropdown: { backgroundColor: '#F2E6E3', borderRadius: wp(12), overflow: 'hidden', marginTop: hp(4) },
  pickerOption: { padding: wp(12), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(140,100,100,0.2)' },
  pickerOptionText: { fontSize: fp(14), color: '#2C1F1F' },
  pickerSelected: { color: '#C17C74', fontWeight: '600' },
  uploadBox: { borderWidth: 1, borderColor: '#C17C74', borderStyle: 'dashed', borderRadius: wp(12), padding: wp(16), alignItems: 'center' },
  uploadText: { fontSize: fp(13), color: '#C17C74', fontWeight: '500' },
  sendBtn: { backgroundColor: '#C17C74', borderRadius: wp(12), padding: hp(15), alignItems: 'center', marginTop: hp(4) },
  sendBtnText: { fontSize: fp(15), fontWeight: '600', color: '#fff' },
});