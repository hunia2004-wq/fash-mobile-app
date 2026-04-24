import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
bg: '#F5F5F5',
card: '#F2E6E3',
accent: '#C17C74',
accentLight: '#f7edec',
text: '#2c2c2c',
muted: '#888888',
white: '#ffffff',
border: 'rgba(193,124,116,0.18)',
iconBg: '#e3c8c5',
userBubble: '#C17C74',
aiBubble: '#ffffff',
};

// ─── Sample wardrobe items ───────────────────────────────────────────────
const WARDROBE_ITEMS = [
{ id: 'w1', name: 'White Linen Shirt', category: 'Tops', color: 'White', brand: 'Zara' },
{ id: 'w2', name: 'High-Waist Beige Trousers', category: 'Bottoms', color: 'Beige', brand: 'Mango' },
{ id: 'w3', name: 'Floral Midi Dress', category: 'Dresses', color: 'Floral', brand: 'H&M' },
{ id: 'w4', name: 'Oversized Denim Jacket', category: 'Tops', color: 'Blue', brand: "Levi's" },
{ id: 'w5', name: 'Black Slim Jeans', category: 'Bottoms', color: 'Black', brand: 'Zara' },
{ id: 'w6', name: 'Silk Cami Top', category: 'Tops', color: 'Dusty Rose', brand: 'ASOS' },
{ id: 'w7', name: 'White Leather Sneakers', category: 'Shoes', color: 'White', brand: 'Adidas' },
{ id: 'w8', name: 'Beige Trench Coat', category: 'Outerwear', color: 'Beige', brand: 'Massimo Dutti' },
{ id: 'w9', name: 'Gold Hoop Earrings', category: 'Accessories', color: 'Gold', brand: 'Mango' },
{ id: 'w10', name: 'Mini Leather Bag', category: 'Bags', color: 'Tan', brand: 'Zara' },
];

// ─── Suggestions ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
{ icon: '☀️', label: 'Casual day out' },
{ icon: '💼', label: 'Work outfit' },
{ icon: '🌙', label: 'Evening look' },
{ icon: '🌧️', label: 'Rainy day' },
{ icon: '💍', label: 'Date night' },
{ icon: '✈️', label: 'Travel outfit' },
];

// ─── AI CALL ─────────────────────────────────────────────────────────────
const callAIStylist = async (userMessage, conversationHistory) => {
const wardrobeList = WARDROBE_ITEMS.map(
(item) => `- ${item.name} (${item.category}, ${item.color}, ${item.brand})`
).join('\n');

const systemPrompt = `You are a personal AI fashion stylist.

Wardrobe:
${wardrobeList}

Respond only with outfit JSON wrapped in <outfit> tags.`;

const messages = [
...conversationHistory.map((m) => ({
role: m.role,
content: m.content,
})),
{ role: 'user', content: userMessage },
];

const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': 'YOUR_API_KEY',
'anthropic-version': '2023-06-01',
},
body: JSON.stringify({
model: 'claude-sonnet-4-20250514',
max_tokens: 1000,
system: systemPrompt,
messages,
}),
});

const data = await response.json();
return data.content?.[0]?.text || 'Sorry, error occurred.';
};

// ─── Parse AI response ───────────────────────────────────────────────────
const parseAIResponse = (rawText) => {
const outfitRegex = /<outfit>([\s\S]*?)<\/outfit>/g;
const outfits = [];
let match;

while ((match = outfitRegex.exec(rawText)) !== null) {
try {
outfits.push(JSON.parse(match[1].trim()));
} catch (e) {}
}

const text = rawText.replace(/<outfit>[\s\S]*?<\/outfit>/g, '').trim();
return { text, outfits };
};

// ─── Outfit Card ─────────────────────────────────────────────────────────
const OutfitCard = ({ outfit }) => {
return (
<View style={styles.outfitCard}>
<Text style={styles.outfitTitle}>{outfit.title}</Text>

{outfit.items.map((item, i) => (
<Text key={i} style={styles.outfitItem}>• {item}</Text>
))}

<Text style={styles.outfitTip}>{outfit.tip}</Text>
</View>
);
};

// ─── Message Bubble ──────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
const isUser = message.role === 'user';

if (isUser) {
return (
<View style={styles.userRow}>
<View style={styles.userBubble}>
<Text style={styles.userText}>{message.content}</Text>
</View>
</View>
);
}

const { text, outfits } = parseAIResponse(message.content);

return (
<View style={styles.aiRow}>
{outfits.map((o, i) => (
<OutfitCard key={i} outfit={o} />
))}

{text ? (
<View style={styles.aiBubble}>
<Text style={styles.aiText}>{text}</Text>
</View>
) : null}
</View>
);
};

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────
export default function AIStylistScreen() {
const [messages, setMessages] = useState([
{
id: '1',
role: 'assistant',
content: "Hi! I'm your AI stylist 👗 What do you want to wear today?",
},
]);

const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const scrollRef = useRef();

const sendMessage = async () => {
if (!input.trim()) return;

const userMsg = { id: Date.now().toString(), role: 'user', content: input };
setMessages((p) => [...p, userMsg]);
setInput('');
setLoading(true);

const ai = await callAIStylist(input, messages);

setMessages((p) => [...p, { id: Date.now().toString(), role: 'assistant', content: ai }]);
setLoading(false);
};

return (
<SafeAreaView style={styles.safe}>
<StatusBar barStyle="dark-content" />

<ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
{messages.map((m) => (
<MessageBubble key={m.id} message={m} />
))}
{loading && <ActivityIndicator />}
</ScrollView>

<View style={styles.inputBar}>
<TextInput
style={styles.input}
value={input}
onChangeText={setInput}
placeholder="Ask your stylist..."
/>
<TouchableOpacity onPress={sendMessage}>
<Ionicons name="arrow-up" size={22} />
</TouchableOpacity>
</View>
</SafeAreaView>
);
}

// ─── STYLES ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: COLORS.bg },

userRow: { alignItems: 'flex-end', marginBottom: 10 },
aiRow: { marginBottom: 10 },

userBubble: {
backgroundColor: COLORS.accent,
padding: 10,
borderRadius: 12,
},
userText: { color: '#fff' },

aiBubble: {
backgroundColor: '#fff',
padding: 10,
borderRadius: 12,
},
aiText: { color: '#000' },

outfitCard: {
backgroundColor: '#fff',
padding: 12,
borderRadius: 12,
marginBottom: 8,
},
outfitTitle: { fontWeight: 'bold' },
outfitItem: { fontSize: 13 },
outfitTip: { fontStyle: 'italic', marginTop: 5 },

inputBar: {
flexDirection: 'row',
padding: 10,
backgroundColor: '#fff',
alignItems: 'center',
},
input: { flex: 1 },
});
