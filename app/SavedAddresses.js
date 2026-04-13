import { View, Text, StyleSheet } from "react-native";

export default function SavedAddresses() {
return (
<View style={styles.container}>
<Text style={styles.title}>Saved Addresses</Text>
<Text>No addresses added yet.</Text>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, padding: 20 },
title: { fontSize: 20, marginBottom: 10 },
});
