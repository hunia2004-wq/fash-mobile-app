import { View, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

const colors = {
  primary: "#C17C74",
  background: "#FFFFFF",
  text: "#1F2937",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    console.log("Saved:", { name, email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: colors.text,
  },

  input: {
    marginBottom: 15,
    backgroundColor: colors.white,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});
    
