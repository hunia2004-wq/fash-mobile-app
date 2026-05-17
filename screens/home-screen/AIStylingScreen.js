import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { chatWithAIStylist } from '../../services/authService';

const COLORS = {
  bg: '#F5F5F5', card: '#F2E6E3', accent: '#C17C74',
  accentLight: '#f7edec', text: '#2c2c2c', muted: '#888888',
  white: '#ffffff', border: 'rgba(193,124,116,0.18)',
};

const SUGGESTIONS = [
  'What should I wear today?',
  'Suggest a casual outfit',
  'What goes with my jeans?',
  'Help me dress for a dinner',
  'What to wear for work?',
];

const TypingIndicator = () => (
  <View style={styles.typingWrap}>
    <View style={styles.aiBubble}>
      <Text style={styles.typingDots}>• • •</Text>
    </View>
  </View>
);

export default function AIStylingScreen({ navigation, route }) {
  const { prefillMessage } = route.params || {};
  const { getToken } = useAuth();

  const [messages,  setMessages]  = useState([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your FASH AI Stylist 👗\nI can help you build outfits from your wardrobe. What would you like to wear today?",
    },
  ]);
  
  const [input,     setInput]     = useState(prefillMessage ?? '');
  const [loading,   setLoading]   = useState(false);
  const flatListRef = useRef(null);

  // history for context — excludes the initial greeting
  const getHistory = () =>
    messages
      .filter(m => m.id !== '0')
      .map(m => ({ role: m.role, content: m.content }));

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();
      const data  = await chatWithAIStylist(token, trimmed, getHistory());
      console.log('AI response:', JSON.stringify(data, null, 2)); 

      const reply = data.reply ?? data.message ?? data.response ?? data;
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I couldn't connect right now. Please try again!" },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages, getToken]);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <MaterialCommunityIcons name="hanger" size={16} color={COLORS.white} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="hanger" size={18} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Stylist</Text>
            <Text style={styles.headerSub}>Powered by your wardrobe</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={loading ? <TypingIndicator /> : null}
        />

        {/* Suggestion chips — only show when no conversation yet */}
        {messages.length === 1 && !loading && (
          <View style={styles.suggestionsWrap}>
            <FlatList
              horizontal
              data={SUGGESTIONS}
              keyExtractor={s => s}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionChip}
                  onPress={() => sendMessage(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your outfit..."
            placeholderTextColor={COLORS.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color={COLORS.white} />
              : <Ionicons name="send" size={18} color={COLORS.white} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: COLORS.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  navBtn:            { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerCenter:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:      { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { fontSize: 15, fontWeight: '700', color: COLORS.text },
  headerSub:         { fontSize: 11, color: COLORS.muted },
  messagesList:      { padding: 16, paddingBottom: 8 },
  messageRow:        { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  messageRowUser:    { justifyContent: 'flex-end' },
  aiAvatar:          { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  bubble:            { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAI:          { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  bubbleUser:        { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  bubbleText:        { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  bubbleTextUser:    { color: COLORS.white },
  typingWrap:        { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  aiBubble:          { backgroundColor: COLORS.white, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  typingDots:        { fontSize: 18, color: COLORS.accent, letterSpacing: 4 },
  suggestionsWrap:   { paddingVertical: 8 },
  suggestionsRow:    { paddingHorizontal: 16, gap: 8 },
  suggestionChip:    { backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.accent },
  suggestionText:    { fontSize: 12, fontWeight: '600', color: COLORS.accent },
  inputBar:          { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  input:             { flex: 1, backgroundColor: COLORS.bg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn:           { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
});