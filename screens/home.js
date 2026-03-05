import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ signOut }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FASH! 🎉</Text>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#333" },
  button: { backgroundColor: "#C17C74", padding: 15, borderRadius: 10, width: "80%", alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});