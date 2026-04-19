import React, { useState, useContext } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { contactSupport } from '../../services/authService';
import * as ImagePicker from 'expo-image-picker';

const SUBJECTS = [
  'Order issue',
  'Payment problem',
  'Account issue',
  'Delivery issue',
  'Help Request',
  'Report a problem',
  'Other',
];

const ContactSupportScreen = ({ navigation }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [image, setImage] = useState(null);

  const { getToken } = useContext(AuthContext);

  // -------------------------
  // PICK IMAGE
  // -------------------------
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // -------------------------
  // SEND SUPPORT TICKET
  // -------------------------
  const handleSend = async () => {
    if (!subject || !message.trim()) {
      Alert.alert('Missing info', 'Please complete all required fields.');
      return;
    }

    setSending(true);

    try {
      const token = await getToken();

      const response = await contactSupport(token, {
        subject,
        orderNumber,
        message,
        image,
      });

      const { ticketId, status } = response;

      Alert.alert(
        'Message Sent',
        `We'll get back to you within 24 hours.\n\nTicket #${ticketId}\nStatus: ${status}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert(
        'Error',
        e.message || 'Failed to send message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            We aim to reply within 24 hours. For urgent issues, call (+20) 000 00 00 000.
          </Text>
        </View>

        {/* SUBJECT */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Subject</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowSubjectPicker(!showSubjectPicker)}
          >
            <Text style={styles.inputText}>{subject}</Text>
            <Text style={styles.chevron}>
              {showSubjectPicker ? '▲' : '▼'}
            </Text>
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
                  <Text
                    style={[
                      styles.pickerOptionText,
                      s === subject && styles.pickerSelected,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ORDER NUMBER */}
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

        {/* MESSAGE */}
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

        {/* IMAGE */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Attach a photo (optional)</Text>

          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            <Text style={styles.uploadText}>
              {image ? 'Image selected ✓' : '+ Add image'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEND BUTTON */}
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>Send Message</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    position: 'relative',
  },

  backBtn: {
    fontSize: 28,
    color: '#C17C74',
    lineHeight: 32,
  },

  headerTitle: {
    position: 'absolute',
  left: 0,
  right: 0,
  textAlign: 'center',
  fontSize: 17,
  fontWeight: '700',
  color: '#C17C74',
  pointerEvents: 'none', 
  },

  scrollContent: {
    padding: 16,
    gap: 12,
  },

  infoBox: {
    backgroundColor: ' #F5F5F5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#C17C74",
  },

  infoText: {
    fontSize: 13,
    color: "#C17C74",
    fontWeight: "bold",
    lineHeight: 20,
  },

  formGroup: {
    gap: 6,
  },

  formLabel: {
    fontSize: 12,
    color: '#C17C74',
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#F2E6E3',
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
    backgroundColor: '#F2E6E3',
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
    color: '#C17C74',
    fontWeight: '600',
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: '#C17C74',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  uploadText: {
    fontSize: 13,
    color: '#C17C74',
    fontWeight: '500',
  },

  sendBtn: {
    backgroundColor: '#C17C74',
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

