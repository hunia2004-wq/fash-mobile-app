import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const SUBJECTS = ['Order issue', 'Payment problem', 'Account access', 'Delivery issue', 'Other'];

const ContactSupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Missing info', 'Please describe your issue before sending.');
      return;
    }
    Alert.alert('Message Sent', "We'll get back to you within 24 hours.", [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            We aim to reply within 24 hours. For urgent issues, call +1 (800) 000-0000.
          </Text>
        </View>

        {/* Subject Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Subject</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowSubjectPicker(!showSubjectPicker)}
          >
            <Text style={styles.inputText}>{subject}</Text>
            <Text style={styles.chevron}>{showSubjectPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSubjectPicker && (
            <View style={styles.pickerDropdown}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.pickerOption}
                  onPress={() => {
                    setSubject(s);
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, s === subject && styles.pickerSelected]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Number */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Order number (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="#ORD-00000"
            placeholderTextColor="#7A6060"
            value={orderNumber}
            onChangeText={setOrderNumber}
          />
        </View>

        {/* Message */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Describe your issue</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Tell us what happened..."
            placeholderTextColor="#7A6060"
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Attach Photo */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Attach a photo (optional)</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Text style={styles.uploadText}>+ Add image</Text>
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send Message</Text>
        </TouchableOpacity>
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
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    color: '#7A6060',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#EDE0D8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#2C1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 14,
    color: '#2C1F1F',
  },
  chevron: {
    fontSize: 11,
    color: '#7A6060',
  },
  textarea: {
    height: 100,
    alignItems: 'flex-start',
  },
  pickerDropdown: {
    backgroundColor: '#EDE0D8',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(140,100,100,0.2)',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#2C1F1F',
  },
  pickerSelected: {
    color: '#8B5A5A',
    fontWeight: '600',
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#B07070',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 13,
    color: '#8B5A5A',
    fontWeight: '500',
  },
  sendBtn: {
    backgroundColor: '#B07070',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ContactSupportScreen;