import { View, Text, StyleSheet } from "react-native";

export default function SavedCards() {
return (
<View style={styles.container}>
<Text style={styles.title}>Saved Cards</Text>
<Text>No cards saved yet.</Text>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20 },
title: { fontSize: 20, marginBottom: 10 },
});