import { View, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useState } from "react";

export default function EmailAddress() {
const [email, setEmail] = useState("");

return (
<View style={styles.container}>
<Text style={styles.title}>Email Address</Text>

<TextInput
label="Email"
value={email}
onChangeText={setEmail}
style={styles.input}
keyboardType="email-address"
/>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20 },
title: { fontSize: 20, marginBottom: 20 },
input: { marginBottom: 15 },
});
