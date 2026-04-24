import React, { useState, useRef, useEffect } from 'react';
import {
View,
Text,
ScrollView,
StyleSheet,
TouchableOpacity,
StatusBar,
TextInput,
KeyboardAvoidingView,
Platform,
ActivityIndicator,
Animated,
Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
userBubble: '#C17C74',
aiBubble: '#ffffff',
};

const WARDROBE_ITEMS = [
{ id: 'w1', name: 'White Linen Shirt', category: 'Tops' },
{ id: 'w2', name: 'High-Waist Beige Trousers', category: 'Bottoms' },
{ id: 'w3', name: 'Floral Midi Dress', category: 'Dresses' },
{ id: 'w4', name: 'Oversized Denim Jacket', category: 'Tops' },
{ id: 'w5', name: 'Black Slim Jeans', category: 'Bottoms' },
];

const callAIStylist = async (userMessage, history) => {
const wardrobeList = WARDROBE_ITEMS.map(i => `- ${i.name}`).join('\n');

const systemPrompt = `You are a fashion stylist.

Wardrobe:
${wardrobeList}

Respond ONLY like this:

<outfit>
{
"title": "",
"items": [],
"tip": ""
}
</outfit>

Then short message.`;

const res = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': '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',
'anthropic-version': '2023-06-01',
},
body: JSON.stringify({
model: 'claude-3-sonnet-20240229',
max_tokens: 800,
system: systemPrompt,
messages: [
...history,
{ role: 'user', content: userMessage },
],
}),
});

const data = await res.json();
return data?.content?.[0]?.text || 'Error';
};

const parseAIResponse = (text) => {
const regex = /<outfit>([\s\S]*?)<\/outfit>/g;
let outfits = [];
let match;

while ((match = regex.exec(text))) {
try {
outfits.push(JSON.parse(match[1]));
} catch {}
}

const cleanText = text.replace(regex, '').trim();
return { outfits, text: cleanText };
};

const MessageBubble = ({ message }) => {
const isUser = message.role === 'user';

if (isUser) {
return (
<View style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
<View style={styles.userBubble}>
<Text style={{ color: '#fff' }}>{message.content}</Text>
</View>
</View>
);
}

const { outfits, text } = parseAIResponse(message.content);

return (
<View style={{ marginBottom: 10 }}>
{outfits.map((o, i) => (
<View key={i} style={styles.card}>
<Text style={{ fontWeight: 'bold' }}>{o.title}</Text>
{o.items.map((item, idx) => (
<Text key={idx}>• {item}</Text>
))}
<Text style={{ fontStyle: 'italic' }}>{o.tip}</Text>
</View>
))}

{text ? (
<View style={styles.aiBubble}>
<Text>{text}</Text>
</View>
) : null}
</View>
);
};

export default function AIStylistScreen() {
const [messages, setMessages] = useState([
{ role: 'assistant', content: 'Hi 👗 what do you want to wear?' },
]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const scrollRef = useRef();

const send = async () => {
if (!input.trim()) return;

const userMsg = { role: 'user', content: input };
setMessages(prev => [...prev, userMsg]);
setInput('');
setLoading(true);

const aiText = await callAIStylist(input, messages);

setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
setLoading(false);

setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
};

return (
<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
<StatusBar barStyle="dark-content" />

<ScrollView ref={scrollRef} style={{ padding: 16 }}>
{messages.map((m, i) => (
<MessageBubble key={i} message={m} />
))}
{loading && <ActivityIndicator />}
</ScrollView>

<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
<View style={styles.inputBar}>
<TextInput
style={{ flex: 1 }}
value={input}
onChangeText={setInput}
placeholder="Type..."
blurOnSubmit={false}
/>
<TouchableOpacity onPress={send}>
<Ionicons name="arrow-up" size={20} />
</TouchableOpacity>
</View>
</KeyboardAvoidingView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
userBubble: {
backgroundColor: '#C17C74',
padding: 12,
borderRadius: 12,
},
aiBubble: {
backgroundColor: '#fff',
padding: 12,
borderRadius: 12,
},
card: {
backgroundColor: '#fff',
padding: 12,
borderRadius: 12,
marginBottom: 8,
},
inputBar: {
flexDirection: 'row',
padding: 10,
backgroundColor: '#fff',
},
});
