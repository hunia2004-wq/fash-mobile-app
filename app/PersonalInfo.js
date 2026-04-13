import { View, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useState } from "react";

export default function PersonalInfo() {
const [name, setName] = useState("");
const [phone, setPhone] = useState("");

return (
<View style={styles.container}>
<Text style={styles.title}>Personal Information</Text>

<TextInput label="Full Name" value={name} onChangeText={setName} style={styles.input} />
<TextInput label="Phone Number" value={phone} onChangeText={setPhone} style={styles.input} />
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: "#fff" },
title: { fontSize: 20, marginBottom: 20 },
input: { marginBottom: 15 },
});
