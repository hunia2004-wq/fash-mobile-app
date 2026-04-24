import React, { useState, useRef, useEffect } from ‘react’;
import {
View,
Text,
ScrollView,
StyleSheet,
TouchableOpacity,
StatusBar,
Image,
TextInput,
KeyboardAvoidingView,
Platform,
ActivityIndicator,
Animated,
Dimensions,
} from ‘react-native’;
import { Ionicons, Feather, MaterialCommunityIcons } from ‘@expo/vector-icons’;
import { SafeAreaView } from ‘react-native-safe-area-context’;

const { width } = Dimensions.get(‘window’);

const COLORS = {
bg: ‘#F5F5F5’,
card: ‘#F2E6E3’,
accent: ‘#C17C74’,
accentLight: ‘#f7edec’,
text: ‘#2c2c2c’,
muted: ‘#888888’,
white: ‘#ffffff’,
border: ‘rgba(193,124,116,0.18)’,
iconBg: ‘#e3c8c5’,
userBubble: ‘#C17C74’,
aiBubble: ‘#ffffff’,
};

(mehtageen neghayar dol 3ala ely mawgoud)
const WARDROBE_ITEMS = [
{ id: ‘w1’, name: ‘White Linen Shirt’, category: ‘Tops’, color: ‘White’, brand: ‘Zara’ },
{ id: ‘w2’, name: ‘High-Waist Beige Trousers’, category: ‘Bottoms’, color: ‘Beige’, brand: ‘Mango’ },
{ id: ‘w3’, name: ‘Floral Midi Dress’, category: ‘Dresses’, color: ‘Floral’, brand: ‘H&M’ },
{ id: ‘w4’, name: ‘Oversized Denim Jacket’, category: ‘Tops’, color: ‘Blue’, brand: “Levi’s” },
{ id: ‘w5’, name: ‘Black Slim Jeans’, category: ‘Bottoms’, color: ‘Black’, brand: ‘Zara’ },
{ id: ‘w6’, name: ‘Silk Cami Top’, category: ‘Tops’, color: ‘Dusty Rose’, brand: ‘ASOS’ },
{ id: ‘w7’, name: ‘White Leather Sneakers’, category: ‘Shoes’, color: ‘White’, brand: ‘Adidas’ },
{ id: ‘w8’, name: ‘Beige Trench Coat’, category: ‘Outerwear’, color: ‘Beige’, brand: ‘Massimo Dutti’ },
{ id: ‘w9’, name: ‘Gold Hoop Earrings’, category: ‘Accessories’, color: ‘Gold’, brand: ‘Mango’ },
{ id: ‘w10’, name: ‘Mini Leather Bag’, category: ‘Bags’, color: ‘Tan’, brand: ‘Zara’ },
];


const SUGGESTIONS = [
{ icon: ‘☀️’, label: ‘Casual day out’ },
{ icon: ‘💼’, label: ‘Work outfit’ },
{ icon: ‘🌙’, label: ‘Evening look’ },
{ icon: ‘🌧️’, label: ‘Rainy day’ },
{ icon: ‘💍’, label: ‘Date night’ },
{ icon: ‘✈️’, label: ‘Travel outfit’ },
];


const callAIStylist = async (userMessage, conversationHistory) => {
const wardrobeList = WARDROBE_ITEMS.map(
(item) => `- ${item.name} (${item.category}, ${item.color}, ${item.brand})`
).join(’\n’);

const systemPrompt = `You are a personal AI fashion stylist inside a fashion app. You help users create outfits from their wardrobe.

The user’s wardrobe contains:
${wardrobeList}

Your job:

1. Suggest specific outfit combinations using ONLY items from their wardrobe above
1. For each outfit suggestion, respond in this EXACT JSON format wrapped in <outfit> tags:

<outfit>
{
"title": "Outfit name",
"occasion": "When to wear it",
"vibe": "Style vibe (e.g. Casual Chic, Office Ready, etc.)",
"items": ["Item name 1", "Item name 2", "Item name 3"],
"tip": "One short styling tip"
}
</outfit>

1. You can suggest 1-3 outfits per message depending on the request
1. After the outfit JSON(s), add a short friendly text message (1-2 sentences max)
1. If the user asks something unrelated to fashion/styling, gently redirect them
1. Be warm, encouraging, and stylish in tone
1. Always use items EXACTLY as named in the wardrobe list`;

const messages = [
…conversationHistory.map((m) => ({
role: m.role,
content: m.content,
})),
{ role: ‘user’, content: userMessage },
];

const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 1000,
system: systemPrompt,
messages,
}),
});

const data = await response.json();
return data.content?.[0]?.text || ‘Sorry, I could not generate a suggestion right now.’;
};


const parseAIResponse = (rawText) => {
const outfitRegex = /<outfit>([\s\S]*?)</outfit>/g;
const outfits = [];
let match;

while ((match = outfitRegex.exec(rawText)) !== null) {
try {
const parsed = JSON.parse(match[1].trim());
outfits.push(parsed);
} catch (_) {}
}

const cleanText = rawText.replace(/<outfit>[\s\S]*?</outfit>/g, ‘’).trim();
return { text: cleanText, outfits };
};


const OutfitCard = ({ outfit }) => {
const categoryIcons = {
Tops: ‘shirt-outline’,
Bottoms: ‘albums-outline’,
Dresses: ‘flower-outline’,
Shoes: ‘footsteps-outline’,
Bags: ‘bag-outline’,
Accessories: ‘diamond-outline’,
Outerwear: ‘cloud-outline’,
};

return (
<View style={styles.outfitCard}>
{/* Card header */}
<View style={styles.outfitCardHeader}>
<View style={styles.outfitVibeTag}>
<Text style={styles.outfitVibeText}>{outfit.vibe}</Text>
</View>
<Text style={styles.outfitOccasion}>{outfit.occasion}</Text>
</View>

```
<Text style={styles.outfitTitle}>{outfit.title}</Text>

{/* Items list */}
<View style={styles.outfitItems}>
{outfit.items.map((item, i) => {
const wardrobeItem = WARDROBE_ITEMS.find((w) => w.name === item);
const iconName = wardrobeItem
? (categoryIcons[wardrobeItem.category] || 'shirt-outline')
: 'shirt-outline';
return (
<View key={i} style={styles.outfitItem}>
<View style={styles.outfitItemIcon}>
<Ionicons name={iconName} size={13} color={COLORS.accent} />
</View>
<Text style={styles.outfitItemText}>{item}</Text>
</View>
);
})}
</View>

{/* Tip */}
{outfit.tip && (
<View style={styles.outfitTip}>
<Ionicons name="sparkles" size={12} color={COLORS.accent} />
<Text style={styles.outfitTipText}>{outfit.tip}</Text>
</View>
)}
</View>
```

);
};

const MessageBubble = ({ message }) => {
const isUser = message.role === ‘user’;
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(10)).current;

useEffect(() => {
Animated.parallel([
Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
]).start();
}, []);

if (isUser) {
return (
<Animated.View
style={[
styles.messageRow,
styles.userRow,
{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
]}
>
<View style={styles.userBubble}>
<Text style={styles.userBubbleText}>{message.content}</Text>
</View>
</Animated.View>
);
}

const { text, outfits } = parseAIResponse(message.content);

return (
<Animated.View
style={[
styles.messageRow,
styles.aiRow,
{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
]}
>
{/* AI Avatar */}
<View style={styles.aiAvatar}>
<MaterialCommunityIcons name="hanger" size={16} color={COLORS.white} />
</View>

```
<View style={styles.aiContent}>
{/* Outfit cards first */}
{outfits.map((outfit, i) => (
<OutfitCard key={i} outfit={outfit} />
))}
{/* Text bubble */}
{text ? (
<View style={styles.aiBubble}>
<Text style={styles.aiBubbleText}>{text}</Text>
</View>
) : null}
</View>
</Animated.View>
```

);
};


const TypingIndicator = () => {
const dot1 = useRef(new Animated.Value(0)).current;
const dot2 = useRef(new Animated.Value(0)).current;
const dot3 = useRef(new Animated.Value(0)).current;

useEffect(() => {
const animate = (dot, delay) => {
Animated.loop(
Animated.sequence([
Animated.delay(delay),
Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
Animated.delay(600),
])
).start();
};
animate(dot1, 0);
animate(dot2, 150);
animate(dot3, 300);
}, []);

return (
<View style={styles.messageRow}>
<View style={styles.aiAvatar}>
<MaterialCommunityIcons name="hanger" size={16} color={COLORS.white} />
</View>
<View style={[styles.aiBubble, { paddingVertical: 14, paddingHorizontal: 18 }]}>
<View style={{ flexDirection: ‘row’, gap: 5, alignItems: ‘center’ }}>
{[dot1, dot2, dot3].map((dot, i) => (
<Animated.View
key={i}
style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
/>
))}
</View>
</View>
</View>
);
};


export default function AIStylistScreen({ navigation }) {
const [messages, setMessages] = useState([
{
id: ‘welcome’,
role: ‘assistant’,
content:
‘Hi! I'm your personal AI stylist ✨ I've looked through your wardrobe and I'm ready to put together some amazing outfits for you. What's the occasion?’,
},
]);
const [input, setInput] = useState(’’);
const [isLoading, setIsLoading] = useState(false);
const scrollRef = useRef(null);

const scrollToBottom = () => {
setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
};

useEffect(() => {
scrollToBottom();
}, [messages, isLoading]);

const sendMessage = async (text) => {
const userText = text || input.trim();
if (!userText || isLoading) return;
setInput(’’);

```
const userMessage = { id: Date.now().toString(), role: 'user', content: userText };
setMessages((prev) => [...prev, userMessage]);
setIsLoading(true);

try {
// Build history excluding the welcome message for the API
const history = messages
.filter((m) => m.id !== 'welcome')
.map((m) => ({ role: m.role, content: m.content }));

const aiText = await callAIStylist(userText, history);

setMessages((prev) => [
...prev,
{ id: (Date.now() + 1).toString(), role: 'assistant', content: aiText },
]);
} catch (err) {
setMessages((prev) => [
...prev,
{
id: (Date.now() + 1).toString(),
role: 'assistant',
content: 'Oops! Something went wrong. Please try again in a moment.',
},
]);
} finally {
setIsLoading(false);
}
```

};

return (
<SafeAreaView style={styles.safe} edges={[‘top’]}>
<StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

```
{/* Header */}
<View style={styles.header}>
<TouchableOpacity
style={styles.navBtn}
onPress={() => navigation.goBack()}
activeOpacity={0.8}
>
<Ionicons name="arrow-back" size={20} color={COLORS.text} />
</TouchableOpacity>

<View style={styles.headerCenter}>
<View style={styles.headerAvatar}>
<MaterialCommunityIcons name="hanger" size={18} color={COLORS.white} />
</View>
<View>
<Text style={styles.headerTitle}>AI Stylist</Text>
<View style={styles.onlineRow}>
<View style={styles.onlineDot} />
<Text style={styles.onlineText}>Powered by Claude</Text>
</View>
</View>
</View>

<TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
<Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
</TouchableOpacity>
</View>

<KeyboardAvoidingView
style={{ flex: 1 }}
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
keyboardVerticalOffset={0}
>
{/* Messages */}
<ScrollView
ref={scrollRef}
showsVerticalScrollIndicator={false}
contentContainerStyle={styles.messagesContent}
keyboardShouldPersistTaps="handled"
>
{/* Wardrobe summary chip */}
<View style={styles.wardrobeChip}>
<MaterialCommunityIcons name="wardrobe-outline" size={13} color={COLORS.accent} />
<Text style={styles.wardrobeChipText}>
{WARDROBE_ITEMS.length} wardrobe items loaded
</Text>
</View>

{messages.map((msg) => (
<MessageBubble key={msg.id} message={msg} />
))}

{isLoading && <TypingIndicator />}
</ScrollView>

{/* Quick suggestions — shown only when no messages yet beyond welcome */}
{messages.length <= 1 && !isLoading && (
<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
contentContainerStyle={styles.suggestionsRow}
>
{SUGGESTIONS.map((s) => (
<TouchableOpacity
key={s.label}
style={styles.suggestionPill}
onPress={() => sendMessage(s.label)}
activeOpacity={0.8}
>
<Text style={styles.suggestionEmoji}>{s.icon}</Text>
<Text style={styles.suggestionText}>{s.label}</Text>
</TouchableOpacity>
))}
</ScrollView>
)}

{/* Input bar */}
<View style={styles.inputBar}>
<View style={styles.inputWrap}>
<TextInput
style={styles.textInput}
placeholder="Ask your stylist…"
placeholderTextColor={COLORS.muted}
value={input}
onChangeText={setInput}
multiline
maxLength={500}
onSubmitEditing={() => sendMessage()}
/>
</View>
<TouchableOpacity
style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
onPress={() => sendMessage()}
activeOpacity={0.85}
disabled={!input.trim() || isLoading}
>
{isLoading ? (
<ActivityIndicator size="small" color={COLORS.white} />
) : (
<Ionicons name="arrow-up" size={18} color={COLORS.white} />
)}
</TouchableOpacity>
</View>
</KeyboardAvoidingView>
</SafeAreaView>
```

);
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: COLORS.bg },

header: {
flexDirection: ‘row’,
alignItems: ‘center’,
justifyContent: ‘space-between’,
paddingHorizontal: 16,
paddingVertical: 12,
backgroundColor: COLORS.white,
borderBottomWidth: 1,
borderBottomColor: COLORS.border,
},
navBtn: {
width: 40,
height: 40,
borderRadius: 12,
backgroundColor: COLORS.card,
alignItems: ‘center’,
justifyContent: ‘center’,
},
headerCenter: { flexDirection: ‘row’, alignItems: ‘center’, gap: 10 },
headerAvatar: {
width: 38,
height: 38,
borderRadius: 19,
backgroundColor: COLORS.accent,
alignItems: ‘center’,
justifyContent: ‘center’,
},
headerTitle: { fontSize: 15, fontWeight: ‘700’, color: COLORS.text },
onlineRow: { flexDirection: ‘row’, alignItems: ‘center’, gap: 4, marginTop: 1 },
onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ‘#6abf7b’ },
onlineText: { fontSize: 11, color: COLORS.muted },

messagesContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },

wardrobeChip: {
flexDirection: ‘row’,
alignItems: ‘center’,
alignSelf: ‘center’,
backgroundColor: COLORS.accentLight,
borderRadius: 20,
paddingHorizontal: 12,
paddingVertical: 6,
gap: 5,
marginBottom: 20,
},
wardrobeChipText: { fontSize: 11, color: COLORS.accent, fontWeight: ‘600’ },

messageRow: { marginBottom: 16, flexDirection: ‘row’, alignItems: ‘flex-end’ },
userRow: { justifyContent: ‘flex-end’ },
aiRow: { justifyContent: ‘flex-start’, gap: 8 },

userBubble: {
backgroundColor: COLORS.userBubble,
borderRadius: 20,
borderBottomRightRadius: 4,
paddingHorizontal: 16,
paddingVertical: 12,
maxWidth: width * 0.72,
},
userBubbleText: { color: COLORS.white, fontSize: 14, lineHeight: 20 },

aiAvatar: {
width: 30,
height: 30,
borderRadius: 15,
backgroundColor: COLORS.accent,
alignItems: ‘center’,
justifyContent: ‘center’,
marginBottom: 2,
flexShrink: 0,
},

aiContent: { flex: 1, gap: 8, maxWidth: width * 0.78 },

aiBubble: {
backgroundColor: COLORS.aiBubble,
borderRadius: 20,
borderBottomLeftRadius: 4,
paddingHorizontal: 16,
paddingVertical: 12,
shadowColor: COLORS.accent,
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.08,
shadowRadius: 4,
elevation: 1,
},
aiBubbleText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },

typingDot: {
width: 7,
height: 7,
borderRadius: 3.5,
backgroundColor: COLORS.accent,
opacity: 0.6,
},

// ── Outfit Card ──
outfitCard: {
backgroundColor: COLORS.white,
borderRadius: 18,
borderBottomLeftRadius: 4,
padding: 16,
shadowColor: COLORS.accent,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 2,
},
outfitCardHeader: {
flexDirection: ‘row’,
alignItems: ‘center’,
justifyContent: ‘space-between’,
marginBottom: 6,
},
outfitVibeTag: {
backgroundColor: COLORS.accentLight,
paddingHorizontal: 10,
paddingVertical: 3,
borderRadius: 8,
},
outfitVibeText: { fontSize: 10, fontWeight: ‘700’, color: COLORS.accent, textTransform: ‘uppercase’, letterSpacing: 0.5 },
outfitOccasion: { fontSize: 11, color: COLORS.muted },
outfitTitle: { fontSize: 16, fontWeight: ‘800’, color: COLORS.text, marginBottom: 12 },

outfitItems: { gap: 7, marginBottom: 12 },
outfitItem: { flexDirection: ‘row’, alignItems: ‘center’, gap: 8 },
outfitItemIcon: {
width: 26,
height: 26,
borderRadius: 8,
backgroundColor: COLORS.card,
alignItems: ‘center’,
justifyContent: ‘center’,
},
outfitItemText: { fontSize: 13, color: COLORS.text, fontWeight: ‘500’, flex: 1 },

outfitTip: {
flexDirection: ‘row’,
alignItems: ‘flex-start’,
gap: 6,
backgroundColor: COLORS.accentLight,
borderRadius: 10,
padding: 10,
},
outfitTipText: { flex: 1, fontSize: 12, color: COLORS.accent, lineHeight: 17, fontStyle: ‘italic’ },

// ── Suggestions ──
suggestionsRow: {
paddingHorizontal: 16,
paddingVertical: 10,
gap: 8,
},
suggestionPill: {
flexDirection: ‘row’,
alignItems: ‘center’,
backgroundColor: COLORS.white,
borderRadius: 20,
paddingHorizontal: 14,
paddingVertical: 9,
gap: 6,
marginRight: 8,
borderWidth: 1,
borderColor: COLORS.border,
shadowColor: COLORS.accent,
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.06,
shadowRadius: 3,
elevation: 1,
},
suggestionEmoji: { fontSize: 14 },
suggestionText: { fontSize: 13, fontWeight: ‘600’, color: COLORS.text },

// ── Input ──
inputBar: {
flexDirection: ‘row’,
alignItems: ‘flex-end’,
paddingHorizontal: 16,
paddingVertical: 12,
paddingBottom: Platform.OS === ‘ios’ ? 24 : 12,
backgroundColor: COLORS.white,
borderTopWidth: 1,
borderTopColor: COLORS.border,
gap: 10,
},
inputWrap: {
flex: 1,
backgroundColor: COLORS.card,
borderRadius: 20,
paddingHorizontal: 16,
paddingVertical: 10,
maxHeight: 100,
},
textInput: { fontSize: 14, color: COLORS.text, maxHeight: 80 },
sendBtn: {
width: 42,
height: 42,
borderRadius: 21,
backgroundColor: COLORS.accent,
alignItems: ‘center’,
justifyContent: ‘center’,
},
sendBtnDisabled: { opacity: 0.4 },
});
