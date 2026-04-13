import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useState } from "react";

const colors = {
  primary: "#C17C74",
  background: "#FFFFFF",
  text: "#1F2937",
  border: "#E5E7EB",
  light: "#FDF2F0",
};

export default function Notifications() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      {/* Push Notifications */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => setPushEnabled(!pushEnabled)}
      >
        <Text style={styles.itemText}>Push Notifications</Text>
        <Text style={[styles.status, pushEnabled && styles.active]}>
          {pushEnabled ? "ON" : "OFF"}
        </Text>
      </TouchableOpacity>

      {/* Email Notifications */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => setEmailEnabled(!emailEnabled)}
      >
        <Text style={styles.itemText}>Email Notifications</Text>
        <Text style={[styles.status, emailEnabled && styles.active]}>
          {emailEnabled ? "ON" : "OFF"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
